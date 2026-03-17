import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction, generateReference } from "@/lib/paystack";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

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

  // Validate amount: KES 100 – KES 50,000
  if (!amount || !Number.isFinite(amount) || amount < 100 || amount > 50000) {
    return NextResponse.json(
      { error: "Invalid amount (KES 100 – KES 50,000)" },
      { status: 400 }
    );
  }

  const roundedAmount = Math.round(amount * 100) / 100;
  const reference = generateReference("TOP");

  const admin = await createAdminClient();

  // Store the payment reference for webhook verification
  const { error: refError } = await admin.from("payment_references").insert({
    user_id: user.id,
    reference,
    amount: roundedAmount,
    currency: "KES",
    status: "pending",
  });

  if (refError) {
    return NextResponse.json({ error: "Failed to create payment reference" }, { status: 500 });
  }

  try {
    // Initialize Paystack transaction (amount in kobo/cents)
    const paystackData = await initializeTransaction({
      email: user.email!,
      amount: Math.round(roundedAmount * 100), // KES → cents
      reference,
      currency: "KES",
      callback_url: `${BASE}/dashboard/student?payment=success`,
      metadata: {
        user_id: user.id,
        type: "wallet_top_up",
      },
    });

    return NextResponse.json({
      authorization_url: paystackData.authorization_url,
      reference: paystackData.reference,
      access_code: paystackData.access_code,
    });
  } catch (err: unknown) {
    // Mark reference as failed
    await admin
      .from("payment_references")
      .update({ status: "failed" })
      .eq("reference", reference);

    const message = err instanceof Error ? err.message : "Payment initialization failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
