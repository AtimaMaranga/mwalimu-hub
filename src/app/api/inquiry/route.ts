import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { sendInquiryNotification } from "@/lib/email";

const schema = z.object({
  teacher_id: z.string().uuid(),
  teacher_name: z.string(),
  student_name: z.string().min(2),
  student_email: z.string().email(),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  preferred_times: z.string().optional(),
  message: z.string().min(20),
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
    const supabase = await createAdminClient();

    const { error: dbError } = await supabase.from("student_inquiries").insert({
      teacher_id: data.teacher_id,
      student_name: data.student_name,
      student_email: data.student_email,
      message: data.message,
      preferred_times: data.preferred_times || null,
      experience_level: data.experience_level,
    });

    if (dbError) {
      console.error("Inquiry DB error:", dbError.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    await sendInquiryNotification({
      teacher_name: data.teacher_name,
      student_name: data.student_name,
      student_email: data.student_email,
      message: data.message,
      experience_level: data.experience_level,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Inquiry API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
