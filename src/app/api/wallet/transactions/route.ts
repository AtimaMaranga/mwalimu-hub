import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const type = searchParams.get("type"); // top_up, lesson_charge, refund
  const offset = (page - 1) * limit;

  const admin = await createAdminClient();

  // Get wallet
  const { data: wallet } = await admin
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ transactions: [], total: 0, page, limit });
  }

  let query = admin
    .from("wallet_transactions")
    .select("*", { count: "exact" })
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type && ["top_up", "lesson_charge", "refund", "payout", "commission"].includes(type)) {
    query = query.eq("type", type);
  }

  const { data: transactions, count } = await query;

  return NextResponse.json({
    transactions: transactions ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
