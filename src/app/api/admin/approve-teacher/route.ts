import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTeacherApprovedEmail, sendTeacherRejectedEmail } from "@/lib/email";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teacherId, action } = await request.json();
  if (!teacherId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Fetch teacher details before updating so we have name, email, slug
  const { data: teacher, error: fetchError } = await supabase
    .from("teachers")
    .select("name, email, slug")
    .eq("id", teacherId)
    .single();

  if (fetchError || !teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("teachers")
    .update({ is_published: action === "approve" })
    .eq("id", teacherId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send notification email to teacher
  if (teacher.email) {
    try {
      if (action === "approve") {
        await sendTeacherApprovedEmail({
          name: teacher.name,
          email: teacher.email,
          slug: teacher.slug,
        });
      } else {
        await sendTeacherRejectedEmail({
          name: teacher.name,
          email: teacher.email,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send teacher notification email:", emailErr);
      // Don't fail the request if email fails
    }
  }

  return NextResponse.json({ success: true });
}
