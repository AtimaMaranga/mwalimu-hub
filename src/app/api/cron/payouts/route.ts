import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateReference, generateReceiptNumber } from "@/lib/paystack";

/**
 * Biweekly teacher payout CRON.
 * Should be called on the 2nd and 4th Friday of each month.
 * Protected by CRON_SECRET header.
 *
 * Deploy as a Vercel Cron Job or call from an external scheduler:
 *   POST /api/cron/payouts
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  // Verify CRON secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const now = new Date();

  // Calculate payout period: from last payout date to now
  // For simplicity, use the 1st–14th or 15th–end of month
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  let periodStart: Date;
  let periodEnd: Date;

  if (day <= 15) {
    // Paying for 1st-14th
    periodStart = new Date(year, month, 1);
    periodEnd = new Date(year, month, 14);
  } else {
    // Paying for 15th-end of month
    periodStart = new Date(year, month, 15);
    periodEnd = new Date(year, month + 1, 0); // last day of month
  }

  const periodStartStr = periodStart.toISOString().split("T")[0];
  const periodEndStr = periodEnd.toISOString().split("T")[0];

  // Find all unpaid earnings within the payout period
  const { data: unpaidEarnings } = await admin
    .from("teacher_earnings")
    .select("*")
    .eq("status", "unpaid")
    .lte("created_at", periodEnd.toISOString());

  if (!unpaidEarnings || unpaidEarnings.length === 0) {
    return NextResponse.json({ message: "No unpaid earnings to process", payouts: 0 });
  }

  // Group by teacher
  const teacherTotals: Record<string, { total: number; earningIds: string[] }> = {};
  for (const earning of unpaidEarnings) {
    const tid = earning.teacher_id;
    if (!teacherTotals[tid]) {
      teacherTotals[tid] = { total: 0, earningIds: [] };
    }
    teacherTotals[tid].total += Number(earning.net_amount);
    teacherTotals[tid].earningIds.push(earning.id);
  }

  let payoutsCreated = 0;

  for (const [teacherId, { total, earningIds }] of Object.entries(teacherTotals)) {
    // Minimum payout threshold: KES 500
    if (total < 500) continue;

    const reference = generateReference("PAY");

    // Create payout record
    const { data: payout, error: payoutError } = await admin
      .from("teacher_payouts")
      .insert({
        teacher_id: teacherId,
        amount: Math.round(total * 100) / 100,
        currency: "KES",
        status: "pending",
        payout_period_start: periodStartStr,
        payout_period_end: periodEndStr,
      })
      .select()
      .single();

    if (payoutError || !payout) continue;

    // Mark earnings as processing
    await admin
      .from("teacher_earnings")
      .update({ status: "processing", payout_id: payout.id })
      .in("id", earningIds);

    // TODO: Initiate actual Paystack transfer here
    // For now, mark as pending — admin can trigger actual transfer
    // When Paystack transfer webhook confirms, update status to "completed"

    // Get teacher's user_id for receipt
    const { data: teacher } = await admin
      .from("teachers")
      .select("id")
      .eq("id", teacherId)
      .single();

    if (teacher) {
      // Find the user linked to this teacher
      const { data: teacherProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("teacher_id", teacherId)
        .single();

      if (teacherProfile) {
        await admin.from("receipts").insert({
          user_id: teacherProfile.id,
          receipt_number: generateReceiptNumber("payout"),
          type: "payout",
          amount: Math.round(total * 100) / 100,
          currency: "KES",
          description: `Payout for period ${periodStartStr} to ${periodEndStr}`,
        });
      }
    }

    payoutsCreated++;
  }

  return NextResponse.json({
    message: `Processed ${payoutsCreated} teacher payouts`,
    payouts: payoutsCreated,
    period: { start: periodStartStr, end: periodEndStr },
  });
}
