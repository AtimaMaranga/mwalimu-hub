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

  const userId = user.id;

  // 2. Admin client to bypass RLS for deletion
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Delete teacher record if one exists
  await admin.from("teachers").delete().eq("user_id", userId);

  // 4. Delete profile
  await admin.from("profiles").delete().eq("id", userId);

  // 5. Delete the auth user — this is the irreversible step
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // 6. Sign out the session cookie
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
