import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getInitials } from "@/lib/utils";
import StudentProfileForm from "./StudentProfileForm";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.email?.split("@")[0] || "Student";

  return (
    <DashboardShell
      role="student"
      userName={name}
      userInitials={getInitials(name)}
      userRole="Student"
    >
      <StudentProfileForm
        userId={user.id}
        userEmail={user.email!}
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? ""}
      />
    </DashboardShell>
  );
}
