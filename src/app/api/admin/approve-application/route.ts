import { NextRequest, NextResponse } from "next/server";
import { createClient, createPureAdminClient } from "@/lib/supabase/server";
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

  // Use admin client to bypass RLS for reading applications
  const adminClient = createPureAdminClient();

  const { data: application, error: fetchError } = await adminClient
    .from("teacher_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (action === "approve") {
    const slug = `${slugify(application.name)}-${Date.now().toString(36)}`;

    // 1. Create the teacher record
    const { data: teacher, error: insertError } = await adminClient
      .from("teachers")
      .insert({
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
      })
      .select("id")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "A teacher with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 2. Check if the teacher already has an auth account
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === application.email.toLowerCase()
    );

    if (existingUser) {
      // Teacher already has an account — update their profile to teacher role and link
      await adminClient
        .from("profiles")
        .upsert({
          id: existingUser.id,
          role: "teacher",
          full_name: application.name,
          teacher_id: teacher!.id,
        });
    } else {
      // 3. Invite the teacher — creates auth user + triggers handle_new_user()
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        application.email,
        {
          data: { role: "teacher", full_name: application.name },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard/teacher&welcome=1`,
        }
      );

      if (inviteError) {
        console.error("Invite error:", inviteError);
        // Don't fail the whole approval if invite fails — teacher record is created
      } else if (inviteData?.user) {
        // 4. Link the profile to the teacher record
        await adminClient
          .from("profiles")
          .upsert({
            id: inviteData.user.id,
            role: "teacher",
            full_name: application.name,
            teacher_id: teacher!.id,
          });
      }
    }

    // 5. Mark application as approved
    const { error: approveError } = await adminClient
      .from("teacher_applications")
      .update({ status: "approved" })
      .eq("id", applicationId);

    if (approveError) {
      console.error("Failed to update application status to approved:", approveError.message);
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
    }

    try {
      await sendTeacherApprovedEmail({ name: application.name, email: application.email, slug });
    } catch (e) {
      console.error("Approval email failed:", e);
    }
  } else {
    const { error: rejectError } = await adminClient
      .from("teacher_applications")
      .update({ status: "rejected" })
      .eq("id", applicationId);

    if (rejectError) {
      console.error("Failed to update application status to rejected:", rejectError.message);
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
    }

    try {
      await sendTeacherRejectedEmail({ name: application.name, email: application.email });
    } catch (e) {
      console.error("Rejection email failed:", e);
    }
  }

  return NextResponse.json({ success: true });
}
