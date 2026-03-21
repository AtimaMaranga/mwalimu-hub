import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateReference, generateReceiptNumber } from "@/lib/paystack";
import { isAdminEmail } from "@/lib/env";

/**
 * Admin-only refund endpoint.
 * Refunds lesson charges back to the student's wallet.
 * In future, this can also trigger Paystack refunds for direct payment refunds.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const admin = await createAdminClient();

  let body: { lesson_id?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.lesson_id) {
    return NextResponse.json({ error: "lesson_id is required" }, { status: 400 });
  }

  // Fetch the lesson
  const { data: lesson } = await admin
    .from("lessons")
    .select("*")
    .eq("id", body.lesson_id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (Number(lesson.total_charged) <= 0) {
    return NextResponse.json({ error: "No charges to refund" }, { status: 400 });
  }

  // Check if already refunded
  const { data: existingRefund } = await admin
    .from("wallet_transactions")
    .select("id")
    .eq("lesson_id", body.lesson_id)
    .eq("type", "refund")
    .single();

  if (existingRefund) {
    return NextResponse.json({ error: "Lesson already refunded" }, { status: 409 });
  }

  const refundAmount = Number(lesson.total_charged);

  // Get student wallet
  const { data: wallet } = await admin
    .from("wallets")
    .select("*")
    .eq("user_id", lesson.student_id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: "Student wallet not found" }, { status: 404 });
  }

  // Credit the refund
  const newBalance = Number((Number(wallet.balance) + refundAmount).toFixed(2));
  await admin
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", wallet.id);

  // Record refund transaction
  const reference = generateReference("REF");
  await admin.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount: refundAmount,
    type: "refund",
    description: body.reason || `Refund for lesson ${body.lesson_id}`,
    lesson_id: body.lesson_id,
    reference,
    status: "completed",
  });

  // Reverse teacher earnings if exists
  await admin
    .from("teacher_earnings")
    .update({ status: "reversed" })
    .eq("lesson_id", body.lesson_id);

  // Create receipt
  await admin.from("receipts").insert({
    user_id: lesson.student_id,
    receipt_number: generateReceiptNumber("refund"),
    type: "refund",
    amount: refundAmount,
    currency: "USD",
    description: `Refund — ${body.reason || "Lesson refund"}`,
  });

  return NextResponse.json({
    success: true,
    refund_amount: refundAmount,
    new_balance: newBalance,
  });
}
