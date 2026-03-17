import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code    = searchParams.get("code");
  const next    = searchParams.get("next") ?? "/dashboard";
  const role    = searchParams.get("role");
  const welcome = searchParams.get("welcome");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const admin = await createAdminClient();

        // Save role to metadata if coming from Google OAuth and role isn't set yet
        if ((role === "student" || role === "teacher") && !user.user_metadata?.role) {
          await supabase.auth.updateUser({ data: { role } });
        }

        // Resolve the user's display name from various sources
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "";

        // Ensure a profile row exists — fallback if the DB trigger missed it
        const { data: profile } = await admin
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .single();

        if (!profile) {
          const resolvedRole = user.user_metadata?.role ?? role ?? "student";
          await admin.from("profiles").insert({
            id:        user.id,
            role:      resolvedRole,
            full_name: displayName,
          });
        } else if (!profile.role && (role === "student" || role === "teacher")) {
          // Profile exists but role is missing — update it
          await admin
            .from("profiles")
            .update({ role })
            .eq("id", user.id);
        }

        // For returning Google users logging in (no role param), redirect to
        // their correct dashboard based on existing profile
        let resolvedNext = next;
        if (next === "/dashboard" && profile?.role) {
          resolvedNext = `/dashboard/${profile.role}`;
        }

        const destination = welcome === "1"
          ? `${resolvedNext}${resolvedNext.includes("?") ? "&" : "?"}welcome=1`
          : resolvedNext;

        return NextResponse.redirect(`${origin}${destination}`);
      }

      // User is null but no error — still redirect
      const destination = welcome === "1"
        ? `${next}${next.includes("?") ? "&" : "?"}welcome=1`
        : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
