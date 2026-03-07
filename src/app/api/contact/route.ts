import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendContactNotification,
  sendContactConfirmation,
} from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(20),
  phone: z.string().optional(),
  honeypot: z.string().max(0).optional(), // spam protection
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot check — bots fill hidden fields
    if (body.honeypot) {
      return NextResponse.json({ success: true }); // silently succeed
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Save to database
    const supabase = await createAdminClient();
    const { error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        phone: data.phone || null,
        status: "new",
      });

    if (dbError) {
      console.error("Contact DB error:", dbError.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Send emails (non-blocking — don't fail if email fails)
    await Promise.allSettled([
      sendContactNotification(data),
      sendContactConfirmation({ name: data.name, email: data.email }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
