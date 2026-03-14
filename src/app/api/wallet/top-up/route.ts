import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { amount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);

  if (!amount || !Number.isFinite(amount) || amount <= 0 || amount > 500) {
    return NextResponse.json({ error: "Invalid amount (must be $0.01–$500)" }, { status: 400 });
  }

  // Round to 2 decimal places to prevent floating point issues
  const roundedAmount = Math.round(amount * 100) / 100;

  const admin = await createAdminClient();

  // Get or create wallet
  let { data: wallet } = await admin
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    const { data: newWallet, error } = await admin
      .from("wallets")
      .insert({ user_id: user.id, balance: 0, currency: "USD" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
    }
    wallet = newWallet;
  }

  // Atomic update with optimistic lock to prevent concurrent top-up duplication
  const newBalance = Number((Number(wallet.balance) + roundedAmount).toFixed(2));
  const { data: updated, error: updateError } = await admin
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", wallet.id)
    .eq("balance", wallet.balance) // optimistic lock
    .select("balance")
    .single();

  if (updateError || !updated) {
    // Concurrent modification — re-read and try once more
    const { data: freshWallet } = await admin
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!freshWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 500 });
    }

    const retryBalance = Number((Number(freshWallet.balance) + roundedAmount).toFixed(2));
    const { error: retryError } = await admin
      .from("wallets")
      .update({ balance: retryBalance, updated_at: new Date().toISOString() })
      .eq("id", freshWallet.id);

    if (retryError) {
      return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
    }

    // Record transaction
    await admin.from("wallet_transactions").insert({
      wallet_id: freshWallet.id,
      amount: roundedAmount,
      type: "top_up",
      description: `Added $${roundedAmount.toFixed(2)} to wallet`,
    });

    return NextResponse.json({ balance: retryBalance });
  }

  // Record transaction
  await admin.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount: roundedAmount,
    type: "top_up",
    description: `Added $${roundedAmount.toFixed(2)} to wallet`,
  });

  return NextResponse.json({ balance: Number(updated.balance) });
}
