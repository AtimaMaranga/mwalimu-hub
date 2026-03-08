import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminTeachersClient from "./AdminTeachersClient";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function AdminTeachersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    redirect("/");
  }

  const { data: pending } = await supabase
    .from("teachers")
    .select("*")
    .eq("is_published", false)
    .order("created_at", { ascending: false });

  const { data: published } = await supabase
    .from("teachers")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <AdminTeachersClient
      pending={pending ?? []}
      published={published ?? []}
    />
  );
}
