import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  let teacher = null;
  if (profile.role === "teacher" && profile.teacher_id) {
    const { data: t } = await admin
      .from("teachers")
      .select("*")
      .eq("id", profile.teacher_id)
      .single();
    teacher = t;
  }

  // Check if user has a password set (vs social-only auth)
  const { data: { user: authUser } } = await admin.auth.admin.getUserById(user.id);
  const hasPassword = authUser?.app_metadata?.providers?.includes("email") ?? false;

  return NextResponse.json({
    profile,
    teacher,
    email: user.email,
    hasPassword,
    authProvider: authUser?.app_metadata?.provider || "email",
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Get current profile to determine role
  const { data: profile } = await admin
    .from("profiles")
    .select("role, teacher_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Update profiles table
  const profileFields: Record<string, unknown> = {};
  const allowedProfileFields = [
    "first_name", "last_name", "full_name", "phone", "gender",
    "date_of_birth", "country", "timezone", "bio", "avatar_url",
  ];
  for (const key of allowedProfileFields) {
    if (key in body) profileFields[key] = body[key];
  }

  // Auto-compute full_name from first + last
  if (body.first_name !== undefined || body.last_name !== undefined) {
    const fn = (body.first_name as string || "").trim();
    const ln = (body.last_name as string || "").trim();
    profileFields.full_name = [fn, ln].filter(Boolean).join(" ");
  }

  if (Object.keys(profileFields).length > 0) {
    const { error } = await admin
      .from("profiles")
      .update(profileFields)
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update teacher-specific fields
  if (profile.role === "teacher" && profile.teacher_id) {
    const teacherFields: Record<string, unknown> = {};
    const allowedTeacherFields = [
      "tagline", "bio", "experience_years", "hourly_rate",
      "specializations", "languages_spoken", "gender", "date_of_birth",
      "country", "timezone", "phone", "profile_image_url",
    ];
    for (const key of allowedTeacherFields) {
      if (key in body) teacherFields[key] = body[key];
    }

    // Sync name to teacher table
    if (profileFields.full_name) {
      teacherFields.name = profileFields.full_name;
    }

    // Sync avatar to teacher table
    if (body.avatar_url !== undefined) {
      teacherFields.profile_image_url = body.avatar_url;
    }

    if (Object.keys(teacherFields).length > 0) {
      await admin
        .from("teachers")
        .update(teacherFields)
        .eq("id", profile.teacher_id);
    }
  }

  return NextResponse.json({ success: true });
}
