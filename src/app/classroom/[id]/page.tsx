import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClassroomClient from "./ClassroomClient";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  // Verify user is participant
  if (lesson.student_id !== user.id) {
    redirect("/dashboard");
  }

  // Redirect if lesson is already completed
  if (lesson.status !== "active") {
    redirect("/dashboard");
  }

  // Fetch teacher name
  const { data: teacher } = await supabase
    .from("teachers")
    .select("name")
    .eq("id", lesson.teacher_id)
    .single();

  // Fetch wallet balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  return (
    <ClassroomClient
      lesson={{
        id: lesson.id,
        student_id: lesson.student_id,
        teacher_id: lesson.teacher_id,
        status: lesson.status,
        started_at: lesson.started_at,
        ended_at: lesson.ended_at,
        duration_seconds: lesson.duration_seconds,
        rate_per_minute: Number(lesson.rate_per_minute),
        total_charged: Number(lesson.total_charged),
        created_at: lesson.created_at,
      }}
      teacherName={teacher?.name ?? "Teacher"}
      walletBalance={Number(wallet?.balance ?? 0)}
    />
  );
}
