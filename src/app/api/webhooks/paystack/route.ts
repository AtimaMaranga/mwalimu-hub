import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyWebhookSignature, generateReceiptNumber } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  // Verify HMAC SHA-512 signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const admin = await createAdminClient();

  if (event.event === "charge.success") {
    const data = event.data;
    const reference = data.reference as string;
    const amountInCents = data.amount as number;
    const amount = amountInCents / 100; // Convert from kobo/cents to KES

    // Look up the payment reference
    const { data: payRef } = await admin
      .from("payment_references")
      .select("*")
      .eq("reference", reference)
      .single();

    if (!payRef) {
      // Unknown reference — log but don't error (Paystack retries on non-200)
      console.error(`Paystack webhook: unknown reference ${reference}`);
      return NextResponse.json({ received: true });
    }

    // Idempotency: skip if already completed
    if (payRef.status === "completed") {
      return NextResponse.json({ received: true });
    }

    // Mark payment reference as completed
    await admin
      .from("payment_references")
      .update({
        status: "completed",
        provider_response: data,
        completed_at: new Date().toISOString(),
      })
      .eq("id", payRef.id);

    // Get or create wallet
    let { data: wallet } = await admin
      .from("wallets")
      .select("*")
      .eq("user_id", payRef.user_id)
      .single();

    if (!wallet) {
      const { data: newWallet } = await admin
        .from("wallets")
        .insert({ user_id: payRef.user_id, balance: 0, currency: "KES" })
        .select()
        .single();
      wallet = newWallet;
    }

    if (!wallet) {
      console.error(`Paystack webhook: could not find/create wallet for user ${payRef.user_id}`);
      return NextResponse.json({ received: true });
    }

    // Credit wallet with optimistic lock
    const roundedAmount = Math.round(amount * 100) / 100;
    const newBalance = Number((Number(wallet.balance) + roundedAmount).toFixed(2));

    const { data: updated, error: updateError } = await admin
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id)
      .eq("balance", wallet.balance) // optimistic lock
      .select("balance")
      .single();

    if (updateError || !updated) {
      // Retry with fresh balance
      const { data: freshWallet } = await admin
        .from("wallets")
        .select("*")
        .eq("user_id", payRef.user_id)
        .single();

      if (freshWallet) {
        const retryBalance = Number((Number(freshWallet.balance) + roundedAmount).toFixed(2));
        await admin
          .from("wallets")
          .update({ balance: retryBalance, updated_at: new Date().toISOString() })
          .eq("id", freshWallet.id);
      }
    }

    // Record wallet transaction
    await admin.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: roundedAmount,
      type: "top_up",
      description: `Wallet top-up via Paystack (KES ${roundedAmount.toFixed(2)})`,
      reference,
      payment_provider: "paystack",
      provider_reference: data.id?.toString(),
      status: "completed",
      metadata: { paystack_event: data },
    });

    // Create receipt
    await admin.from("receipts").insert({
      user_id: payRef.user_id,
      receipt_number: generateReceiptNumber("top_up"),
      type: "top_up",
      amount: roundedAmount,
      currency: "KES",
      description: `Wallet top-up - KES ${roundedAmount.toFixed(2)}`,
    });
  }

  // Always return 200 so Paystack doesn't retry
  return NextResponse.json({ received: true });
}
