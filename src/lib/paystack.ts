import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

/** Verify Paystack webhook signature (HMAC SHA-512) */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(body)
    .digest("hex");
  return hash === signature;
}

/** Initialize a Paystack transaction */
export async function initializeTransaction(params: {
  email: string;
  amount: number; // in smallest unit (cents)
  reference: string;
  currency?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      currency: params.currency || "USD",
      callback_url: params.callback_url,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }
  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/** Verify a transaction by reference */
export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    }
  );

  const data = await res.json();
  return data.data as {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string };
    metadata?: Record<string, unknown>;
  } | null;
}

/** Create a Paystack transfer recipient (for teacher payouts) */
export async function createTransferRecipient(params: {
  type: "mobile_money" | "nuban";
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: params.type,
      name: params.name,
      account_number: params.account_number,
      bank_code: params.bank_code,
      currency: params.currency || "USD",
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to create transfer recipient");
  }
  return data.data as { recipient_code: string };
}

/** Initiate a Paystack transfer (payout) */
export async function initiateTransfer(params: {
  amount: number; // in cents
  recipient: string; // recipient_code
  reason: string;
  reference: string;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: params.amount,
      recipient: params.recipient,
      reason: params.reason,
      reference: params.reference,
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initiate transfer");
  }
  return data.data as { transfer_code: string; reference: string };
}

/** Generate a unique payment reference */
export function generateReference(prefix = "ST"): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
}

/** Generate a receipt number */
export function generateReceiptNumber(type: string): string {
  const prefix = type === "top_up" ? "RCT" : type === "payout" ? "PAY" : "TXN";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
