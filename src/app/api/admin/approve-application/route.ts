import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTeacherApprovedEmail, sendTeacherRejectedEmail } from "@/lib/email";
import { slugify } from "@/lib/utils";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId, action } = await request.json();
  if (!applicationId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: application, error: fetchError } = await supabase
    .from("teacher_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (action === "approve") {
    // Generate a unique slug from the applicant's name
    const slug = `${slugify(application.name)}-${Date.now().toString(36)}`;

    const { error: insertError } = await supabase.from("teachers").insert({
      name: application.name,
      email: application.email,
      phone: application.phone || null,
      slug,
      bio: application.teaching_philosophy || null,
      qualifications: application.qualifications || null,
      hourly_rate: application.rate_expectation || null,
      availability_description: application.available_hours
        ? `Available ${application.available_hours} hours per week`
        : null,
      is_published: true,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A teacher with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase
      .from("teacher_applications")
      .update({ status: "approved" })
      .eq("id", applicationId);

    try {
      await sendTeacherApprovedEmail({ name: application.name, email: application.email, slug });
    } catch (e) {
      console.error("Approval email failed:", e);
    }
  } else {
    await supabase
      .from("teacher_applications")
      .update({ status: "rejected" })
      .eq("id", applicationId);

    try {
      await sendTeacherRejectedEmail({ name: application.name, email: application.email });
    } catch (e) {
      console.error("Rejection email failed:", e);
    }
  }

  return NextResponse.json({ success: true });
}
