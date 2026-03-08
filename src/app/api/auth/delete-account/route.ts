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

  // Admin client — bypasses RLS
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 2. Look up the user's profile to get their teacher_id (if they're a teacher)
  //    teachers table has no user_id — it links through profiles.teacher_id
  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", userId)
    .single();

  // 3. If they're a teacher, delete the teacher record
  if (profile?.teacher_id) {
    const { error: teacherErr } = await admin
      .from("teachers")
      .delete()
      .eq("id", profile.teacher_id);
    if (teacherErr) {
      return NextResponse.json({ error: `Failed to delete teacher profile: ${teacherErr.message}` }, { status: 500 });
    }
  }

  // 4. Delete the auth user.
  //    The profiles table has ON DELETE CASCADE → profile is deleted automatically.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: `Failed to delete account: ${deleteError.message}` }, { status: 500 });
  }

  // 5. Clear the session cookie
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
