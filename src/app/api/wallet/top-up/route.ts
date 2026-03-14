import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const amount = Number(body.amount);

  if (!amount || amount <= 0 || amount > 500) {
    return NextResponse.json({ error: "Invalid amount (must be $0.01–$500)" }, { status: 400 });
  }

  // Get or create wallet
  let { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    const { data: newWallet, error } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, balance: 0, currency: "USD" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
    }
    wallet = newWallet;
  }

  // Update balance
  const newBalance = Number(wallet.balance) + amount;
  const { error: updateError } = await supabase
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", wallet.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }

  // Record transaction
  await supabase.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount,
    type: "top_up",
    description: `Added $${amount.toFixed(2)} to wallet`,
  });

  return NextResponse.json({ balance: newBalance });
}
