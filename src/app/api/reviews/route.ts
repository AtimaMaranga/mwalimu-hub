import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  teacher_id:    z.string().uuid(),
  student_name:  z.string().min(2).max(100),
  student_email: z.string().email(),
  rating:        z.number().int().min(1).max(5),
  comment:       z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { teacher_id, student_name, student_email, rating, comment } = parsed.data;

    const supabase = await createClient();

    // Prevent duplicate reviews from same email for the same teacher
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("teacher_id", teacher_id)
      .eq("student_email", student_email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a review for this teacher." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        teacher_id,
        student_name: student_name.trim(),
        student_email: student_email.toLowerCase().trim(),
        rating,
        comment: comment?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/reviews error:", error.message);
      return NextResponse.json({ error: "Failed to save review." }, { status: 500 });
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reviews unexpected:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
