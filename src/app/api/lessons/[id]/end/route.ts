import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { deleteDailyRoom } from "@/lib/daily";
import { generateReceiptNumber } from "@/lib/paystack";
import { COMMISSION_RATE } from "@/lib/pricing";

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

  // Fetch active lesson
  const { data: lesson } = await admin
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Active lesson not found" }, { status: 404 });
  }

  // Verify the user is either the student or the linked teacher.
  let authorized = false;

  if (lesson.student_id === user.id) {
    authorized = true;
  } else {
    const { data: profile } = await admin
      .from("profiles")
      .select("teacher_id")
      .eq("id", user.id)
      .single();

    if (profile?.teacher_id && profile.teacher_id === lesson.teacher_id) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // ── Final charge for any partial minute ──
  // If the lesson has been running for a partial minute since the last heartbeat,
  // charge for it now
  const lastChargedSecond = lesson.duration_seconds;
  const startedAt = new Date(lesson.started_at).getTime();
  const now = Date.now();
  const actualDurationSeconds = Math.floor((now - startedAt) / 1000);
  const uncharged = actualDurationSeconds - lastChargedSecond;

  let finalCharge = 0;
  if (uncharged > 10) {
    // Charge for the partial minute if > 10 seconds have passed
    const ratePerMinute = Number(lesson.rate_per_minute);
    finalCharge = Math.round((uncharged / 60) * ratePerMinute * 100) / 100;

    if (finalCharge > 0) {
      const { data: wallet } = await admin
        .from("wallets")
        .select("*")
        .eq("user_id", lesson.student_id)
        .single();

      if (wallet && Number(wallet.balance) > 0) {
        const actualFinalCharge = Math.min(finalCharge, Number(wallet.balance));
        const newBalance = Number((Number(wallet.balance) - actualFinalCharge).toFixed(2));

        await admin
          .from("wallets")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", wallet.id);

        await admin.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          amount: -actualFinalCharge,
          type: "lesson_charge",
          description: `Final charge — partial minute (${uncharged}s)`,
          lesson_id: id,
          status: "completed",
        });

        finalCharge = actualFinalCharge;
      } else {
        finalCharge = 0;
      }
    }
  }

  const totalCharged = Number(lesson.total_charged) + finalCharge;

  // End the lesson
  const { error } = await admin
    .from("lessons")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      duration_seconds: Math.max(lesson.duration_seconds, actualDurationSeconds),
      total_charged: totalCharged,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to end lesson" }, { status: 500 });
  }

  // ── Create teacher earnings record ──
  if (totalCharged > 0) {
    const commissionAmount = Math.round(totalCharged * COMMISSION_RATE * 100) / 100;
    const netAmount = Math.round((totalCharged - commissionAmount) * 100) / 100;

    // Insert teacher earnings (idempotent — unique on lesson_id)
    const { error: earningsError } = await admin.from("teacher_earnings").insert({
      teacher_id: lesson.teacher_id,
      lesson_id: id,
      student_id: lesson.student_id,
      gross_amount: totalCharged,
      commission_rate: COMMISSION_RATE,
      commission_amount: commissionAmount,
      net_amount: netAmount,
      status: "unpaid",
    });

    if (!earningsError) {
      // Record platform revenue
      await admin.from("platform_revenue").insert({
        lesson_id: id,
        amount: commissionAmount,
        description: `Platform commission on lesson ${id}`,
      });

      // Create receipt for the student
      await admin.from("receipts").insert({
        user_id: lesson.student_id,
        receipt_number: generateReceiptNumber("lesson_charge"),
        type: "lesson_charge",
        amount: totalCharged,
        currency: "USD",
        description: `Lesson charge — ${Math.ceil(actualDurationSeconds / 60)} minutes`,
      });
    }
  }

  // Update teacher's total_hours_taught
  const lessonHours = Math.max(lesson.duration_seconds, actualDurationSeconds) / 3600;
  try {
    const { data: t } = await admin
      .from("teachers")
      .select("total_hours_taught")
      .eq("id", lesson.teacher_id)
      .single();
    if (t) {
      const current = Number(t.total_hours_taught) || 0;
      await admin
        .from("teachers")
        .update({ total_hours_taught: Number((current + lessonHours).toFixed(2)) })
        .eq("id", lesson.teacher_id);
    }
  } catch (err) {
    console.error("Failed to update total_hours_taught:", err);
  }

  // Best-effort cleanup of Daily.co room
  if (lesson.daily_room_name) {
    deleteDailyRoom(lesson.daily_room_name).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    duration_seconds: Math.max(lesson.duration_seconds, actualDurationSeconds),
    total_charged: totalCharged,
  });
}
