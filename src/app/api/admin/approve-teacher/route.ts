import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendTeacherApprovedEmail, sendTeacherRejectedEmail } from "@/lib/email";
import { isAdminEmail } from "@/lib/env";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teacherId, action } = await request.json();
  if (!teacherId || !["approve", "reject", "unpublish"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const adminClient = await createAdminClient();

  const { data: teacher, error: fetchError } = await adminClient
    .from("teachers")
    .select("id, name, email, slug, is_published")
    .eq("id", teacherId)
    .single();

  if (fetchError || !teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  if (action === "approve") {
    const { error } = await adminClient
      .from("teachers")
      .update({ is_published: true })
      .eq("id", teacherId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await adminClient
      .from("teacher_applications")
      .update({ status: "approved" })
      .eq("email", teacher.email);

  } else if (action === "reject") {
    await adminClient
      .from("teacher_applications")
      .update({ status: "rejected" })
      .eq("email", teacher.email);

    const { error } = await adminClient
      .from("teachers")
      .delete()
      .eq("id", teacherId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  } else if (action === "unpublish") {
    const { error } = await adminClient
      .from("teachers")
      .update({ is_published: false })
      .eq("id", teacherId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (teacher.email) {
    try {
      if (action === "approve") {
        await sendTeacherApprovedEmail({
          name: teacher.name,
          email: teacher.email,
          slug: teacher.slug,
        });
      } else if (action === "reject") {
        await sendTeacherRejectedEmail({
          name: teacher.name,
          email: teacher.email,
        });
      }
    } catch (emailErr) {
      console.error("Failed to send teacher notification email:", emailErr);
    }
  }

  return NextResponse.json({ success: true });
}
