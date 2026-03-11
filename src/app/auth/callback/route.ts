import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        // Save role to metadata if coming from Google OAuth and role isn't set yet
        if ((role === "student" || role === "teacher") && !user.user_metadata?.role) {
          await supabase.auth.updateUser({ data: { role } });
        }

        // Ensure a profile row exists — fallback if the DB trigger missed it
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          const resolvedRole = user.user_metadata?.role ?? role ?? "student";
          await supabase.from("profiles").insert({
            id:        user.id,
            role:      resolvedRole,
            full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
          });
        }
      }

      // Append ?welcome=1 only when it was requested (new sign-up confirmation)
      const destination = welcome === "1"
        ? `${next}${next.includes("?") ? "&" : "?"}welcome=1`
        : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
