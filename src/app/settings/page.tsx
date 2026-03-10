import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getInitials } from "@/lib/utils";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.email?.split("@")[0] || "User";
  const role = (profile?.role as "student" | "teacher") ?? "student";

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
        fullName={profile?.full_name ?? ""}
        role={role}
      />
    </DashboardShell>
  );
}
