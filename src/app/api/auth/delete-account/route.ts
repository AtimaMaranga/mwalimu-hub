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
  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", userId)
    .maybeSingle();

  // 3. End any active lessons for this user (as student)
  await admin
    .from("lessons")
    .update({ status: "cancelled", ended_at: new Date().toISOString() })
    .eq("student_id", userId)
    .eq("status", "active");

  // 4. Delete wallet (cascade deletes wallet_transactions)
  await admin
    .from("wallets")
    .delete()
    .eq("user_id", userId);

  // 5. If they're a teacher, end any active lessons as teacher, then delete teacher record
  if (profile?.teacher_id) {
    await admin
      .from("lessons")
      .update({ status: "cancelled", ended_at: new Date().toISOString() })
      .eq("teacher_id", profile.teacher_id)
      .eq("status", "active");

    const { error: teacherErr } = await admin
      .from("teachers")
      .delete()
      .eq("id", profile.teacher_id);
    if (teacherErr) {
      return NextResponse.json({ error: `Failed to delete teacher profile: ${teacherErr.message}` }, { status: 500 });
    }
  }

  // 6. For students: delete any inquiries linked to their email.
  if (userEmail && !profile?.teacher_id) {
    await admin
      .from("student_inquiries")
      .delete()
      .eq("student_email", userEmail);
  }

  // 7. Delete the auth user.
  //    The profiles table has ON DELETE CASCADE → profile is deleted automatically.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: `Failed to delete account: ${deleteError.message}` }, { status: 500 });
  }

  // 8. Clear the session cookie (best-effort).
  try {
    await supabase.auth.signOut();
  } catch {
    // Session clearance may fail after user deletion; safe to ignore.
  }

  return NextResponse.json({ success: true });
}
