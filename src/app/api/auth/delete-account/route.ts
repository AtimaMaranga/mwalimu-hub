import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function DELETE() {
  // 1. Verify the requesting user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set." },
      { status: 500 }
    );
  }

  const userId = user.id;
  const userEmail = user.email;

  // Admin client — bypasses RLS
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 2. Look up the user's profile to get their teacher_id (if they're a teacher).
  //    maybeSingle() returns null cleanly when no profile row exists (no error thrown).
  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", userId)
    .maybeSingle();

  // 3. If they're a teacher, delete the teacher record first.
  if (profile?.teacher_id) {
    const { error: teacherErr } = await admin
      .from("teachers")
      .delete()
      .eq("id", profile.teacher_id);
    if (teacherErr) {
      return NextResponse.json({ error: `Failed to delete teacher profile: ${teacherErr.message}` }, { status: 500 });
    }
  }

  // 4. For students: delete any inquiries linked to their email.
  //    This clears any FK or orphaned records before the auth user is removed.
  if (userEmail && !profile?.teacher_id) {
    await admin
      .from("student_inquiries")
      .delete()
      .eq("student_email", userEmail);
  }

  // 5. Delete the auth user.
  //    The profiles table has ON DELETE CASCADE → profile is deleted automatically.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: `Failed to delete account: ${deleteError.message}` }, { status: 500 });
  }

  // 6. Clear the session cookie (best-effort — user is already deleted).
  try {
    await supabase.auth.signOut();
  } catch {
    // Session clearance may fail after user deletion; safe to ignore.
  }

  return NextResponse.json({ success: true });
}
