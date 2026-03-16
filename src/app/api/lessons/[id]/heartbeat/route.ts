import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const FREE_TRIAL_SECONDS = 600; // 10 minutes free for first session

/**
 * Heartbeat endpoint — called every 60s from the classroom.
 * Uses admin client to perform an atomic read-deduct-update cycle.
 * Guards against race conditions by checking balance AFTER deduction.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();

  // Fetch active lesson — verify ownership
  const { data: lesson } = await admin
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("student_id", user.id)
    .eq("status", "active")
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Active lesson not found" }, { status: 404 });
  }

  // Enforce maximum lesson duration (4 hours)
  const MAX_DURATION = 4 * 60 * 60; // 14400 seconds
  if (lesson.duration_seconds >= MAX_DURATION) {
    await admin
      .from("lessons")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      ended: true,
      reason: "max_duration_reached",
      balance: 0,
      duration_seconds: lesson.duration_seconds,
      total_charged: Number(lesson.total_charged),
    });
  }

  // Check if this is a first session (no previous completed lessons between this pair)
  const { count: previousLessonCount } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("student_id", lesson.student_id)
    .eq("teacher_id", lesson.teacher_id)
    .eq("status", "completed")
    .neq("id", id);

  const isFirstSession = (previousLessonCount ?? 0) === 0;
  const newDuration = lesson.duration_seconds + 60;

  // Free period: first session gets 10 minutes free, others get 1 minute grace
  const freeSeconds = isFirstSession ? FREE_TRIAL_SECONDS : 60;
  const inFreePeriod = lesson.duration_seconds < freeSeconds;

  if (inFreePeriod) {
    await admin
      .from("lessons")
      .update({ duration_seconds: newDuration })
      .eq("id", id);

    // Fetch current balance to return it
    const { data: wallet } = await admin
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      ended: false,
      balance: Number(wallet?.balance ?? 0),
      duration_seconds: newDuration,
      total_charged: Number(lesson.total_charged),
      charge: 0,
      is_first_session: isFirstSession,
      free_seconds_remaining: Math.max(0, freeSeconds - newDuration),
    });
  }

  // ── Normal billing from here ──

  // Fetch wallet
  const { data: wallet } = await admin
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const chargeAmount = Number(lesson.rate_per_minute);
  const currentBalance = Number(wallet.balance);

  // If balance is zero or negative, auto-end the lesson
  if (currentBalance <= 0) {
    await admin
      .from("lessons")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      ended: true,
      reason: "insufficient_balance",
      balance: 0,
      duration_seconds: lesson.duration_seconds,
      total_charged: Number(lesson.total_charged),
      is_first_session: isFirstSession,
      free_seconds_remaining: 0,
    });
  }

  // Atomic deduction: use conditional update to prevent race conditions.
  const actualCharge = Math.min(chargeAmount, currentBalance);
  const newBalance = Number((currentBalance - actualCharge).toFixed(2));

  const { data: updatedWallet, error: walletUpdateError } = await admin
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", wallet.id)
    .eq("balance", wallet.balance) // optimistic lock
    .select("balance")
    .single();

  if (walletUpdateError || !updatedWallet) {
    const { data: freshWallet } = await admin
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      ended: false,
      balance: Number(freshWallet?.balance ?? 0),
      duration_seconds: lesson.duration_seconds,
      total_charged: Number(lesson.total_charged),
      charge: 0,
      retried: true,
      is_first_session: isFirstSession,
      free_seconds_remaining: 0,
    });
  }

  const newTotal = Number((Number(lesson.total_charged) + actualCharge).toFixed(2));

  // Record transaction
  await admin.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount: -actualCharge,
    type: "lesson_charge",
    description: `Minute ${Math.ceil(newDuration / 60)} — lesson with teacher`,
    lesson_id: id,
  });

  // Update lesson duration and total
  await admin
    .from("lessons")
    .update({ duration_seconds: newDuration, total_charged: newTotal })
    .eq("id", id);

  // Auto-end if balance depleted
  const shouldEnd = newBalance <= 0;
  if (shouldEnd) {
    await admin
      .from("lessons")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({
    ended: shouldEnd,
    balance: newBalance,
    duration_seconds: newDuration,
    total_charged: newTotal,
    charge: actualCharge,
    is_first_session: isFirstSession,
    free_seconds_remaining: 0,
  });
}
