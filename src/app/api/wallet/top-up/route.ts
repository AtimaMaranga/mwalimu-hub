import { NextResponse } from "next/server";

/**
 * DEPRECATED: Direct wallet top-up is disabled.
 * Use POST /api/wallet/initialize-payment to start a Paystack checkout.
 * Wallet credits are only applied via the verified Paystack webhook.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Direct top-up is disabled. Please use the payment flow." },
    { status: 410 }
  );
}
