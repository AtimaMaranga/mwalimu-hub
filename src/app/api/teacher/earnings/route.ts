import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();

  // Get teacher profile
  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  if (!profile?.teacher_id) {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
  }

  const teacherId = profile.teacher_id;

  // Get all earnings
  const { data: earnings } = await admin
    .from("teacher_earnings")
    .select("id, lesson_id, student_id, net_amount, status, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(50);

  // Calculate summary — only net amounts
  const allEarnings = earnings ?? [];
  const totalEarned = allEarnings.reduce((sum, e) => sum + Number(e.net_amount), 0);
  const unpaidAmount = allEarnings
    .filter((e) => e.status === "unpaid")
    .reduce((sum, e) => sum + Number(e.net_amount), 0);
  const paidAmount = allEarnings
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + Number(e.net_amount), 0);
  const totalLessons = allEarnings.length;

  // Get recent payouts
  const { data: payouts } = await admin
    .from("teacher_payouts")
    .select("id, amount, currency, status, payout_period_start, payout_period_end, processed_at, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Map earnings to hide internal fields — rename net_amount to "amount"
  const safeEarnings = allEarnings.map((e) => ({
    id: e.id,
    lesson_id: e.lesson_id,
    student_id: e.student_id,
    amount: Number(e.net_amount),
    currency: "KES",
    status: e.status,
    created_at: e.created_at,
  }));

  return NextResponse.json({
    summary: {
      total_earned: totalEarned,
      unpaid_balance: unpaidAmount,
      paid_amount: paidAmount,
      total_lessons: totalLessons,
    },
    earnings: safeEarnings,
    payouts: payouts ?? [],
  });
}
