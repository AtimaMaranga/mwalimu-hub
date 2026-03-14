import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Fetch active lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("student_id", user.id)
    .eq("status", "active")
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Active lesson not found" }, { status: 404 });
  }

  // Fetch wallet
  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const chargeAmount = Number(lesson.rate_per_minute);
  const currentBalance = Number(wallet.balance);

  // If balance is zero, auto-end the lesson
  if (currentBalance <= 0) {
    await supabase
      .from("lessons")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      ended: true,
      reason: "insufficient_balance",
      balance: 0,
      duration_seconds: lesson.duration_seconds,
      total_charged: Number(lesson.total_charged),
    });
  }

  // Deduct one minute charge (charge whatever is available if less than full rate)
  const actualCharge = Math.min(chargeAmount, currentBalance);
  const newBalance = Number((currentBalance - actualCharge).toFixed(2));
  const newDuration = lesson.duration_seconds + 60;
  const newTotal = Number((Number(lesson.total_charged) + actualCharge).toFixed(2));

  // Update wallet
  await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", wallet.id);

  // Record transaction
  await supabase.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount: -actualCharge,
    type: "lesson_charge",
    description: `Minute ${Math.ceil(newDuration / 60)} — lesson with teacher`,
    lesson_id: id,
  });

  // Update lesson
  await supabase
    .from("lessons")
    .update({
      duration_seconds: newDuration,
      total_charged: newTotal,
    })
    .eq("id", id);

  // Auto-end if balance depleted
  const shouldEnd = newBalance <= 0;
  if (shouldEnd) {
    await supabase
      .from("lessons")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  return NextResponse.json({
    ended: shouldEnd,
    balance: newBalance,
    duration_seconds: newDuration,
    total_charged: newTotal,
    charge: actualCharge,
  });
}
