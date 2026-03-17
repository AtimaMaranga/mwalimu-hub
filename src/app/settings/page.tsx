import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getInitials } from "@/lib/utils";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = await createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as "student" | "teacher") ?? "student";
  const name = profile?.full_name || user.email?.split("@")[0] || "User";

  let teacher = null;
  if (role === "teacher" && profile?.teacher_id) {
    const { data: t } = await admin
      .from("teachers")
      .select("*")
      .eq("id", profile.teacher_id)
      .single();
    teacher = t;
  }

  // Check auth provider
  const { data: { user: authUser } } = await admin.auth.admin.getUserById(user.id);
  const hasPassword = authUser?.app_metadata?.providers?.includes("email") ?? false;
  const authProvider = authUser?.app_metadata?.provider || "email";

  return (
    <DashboardShell
      role={role}
      userName={name}
      userInitials={getInitials(name)}
      userRole={role === "teacher" ? "Teacher" : "Student"}
    >
      <SettingsClient
        userId={user.id}
        userEmail={user.email!}
        role={role}
        profile={profile}
        teacher={teacher}
        hasPassword={hasPassword}
        authProvider={authProvider}
      />
    </DashboardShell>
  );
}
