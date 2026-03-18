import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendApplicationNotification,
  sendApplicationConfirmation,
} from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  gender: z.string().max(20).optional(),
  age_bracket: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  experience: z.string().min(10).max(5000),
  qualifications: z.string().min(5).max(3000),
  available_hours: z.number().min(1).max(168),
  rate_expectation: z.number().min(5).max(200).optional(),
  teaching_philosophy: z.string().min(50).max(5000),
  agree_terms: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (!data.agree_terms) {
      return NextResponse.json(
        { error: "You must agree to the terms" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const { error: dbError } = await supabase
      .from("teacher_applications")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        gender: data.gender || null,
        age_bracket: data.age_bracket || null,
        country: data.country || null,
        city: data.city || null,
        experience: data.experience,
        qualifications: data.qualifications,
        available_hours: data.available_hours,
        rate_expectation: data.rate_expectation || null,
        teaching_philosophy: data.teaching_philosophy,
        status: "pending",
      });

    if (dbError) {
      console.error("Application DB error:", dbError.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const [notifyResult, confirmResult] = await Promise.allSettled([
      sendApplicationNotification(data),
      sendApplicationConfirmation({ name: data.name, email: data.email }),
    ]);

    if (notifyResult.status === "rejected") {
      console.error("Admin notification email failed:", notifyResult.reason);
    }
    if (confirmResult.status === "rejected") {
      console.error("Applicant confirmation email failed:", confirmResult.reason);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
