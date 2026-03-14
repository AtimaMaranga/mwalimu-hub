import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json({ wallet });
}
