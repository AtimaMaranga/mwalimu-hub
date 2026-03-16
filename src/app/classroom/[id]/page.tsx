import { redirect, notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
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

  const admin = await createAdminClient();

  // Fetch lesson
  const { data: lesson } = await admin
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  // Verify user is participant (student or teacher)
  const isStudent = lesson.student_id === user.id;

  let isTeacher = false;
  if (!isStudent) {
    const { data: profile } = await admin
      .from("profiles")
      .select("teacher_id")
      .eq("id", user.id)
      .single();
    isTeacher = profile?.teacher_id === lesson.teacher_id;
  }

  if (!isStudent && !isTeacher) {
    redirect("/dashboard");
  }

  // Redirect if lesson is already completed
  if (lesson.status !== "active") {
    redirect("/dashboard");
  }

  // Fetch teacher name
  const { data: teacher } = await admin
    .from("teachers")
    .select("name")
    .eq("id", lesson.teacher_id)
    .single();

  // Fetch student name
  const { data: studentProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", lesson.student_id)
    .single();

  // Fetch wallet balance (student's wallet for billing display)
  const { data: wallet } = await admin
    .from("wallets")
    .select("balance")
    .eq("user_id", lesson.student_id)
    .single();

  // Check if this is the first session between this student and teacher
  const { count: previousLessonCount } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("student_id", lesson.student_id)
    .eq("teacher_id", lesson.teacher_id)
    .eq("status", "completed")
    .neq("id", lesson.id);

  const isFirstSession = (previousLessonCount ?? 0) === 0;

  const partnerName = isStudent
    ? (teacher?.name ?? "Teacher")
    : (studentProfile?.full_name ?? "Student");

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
        daily_room_url: lesson.daily_room_url,
        daily_room_name: lesson.daily_room_name,
        created_at: lesson.created_at,
      }}
      partnerName={partnerName}
      walletBalance={Number(wallet?.balance ?? 0)}
      role={isStudent ? "student" : "teacher"}
      isFirstSession={isFirstSession}
    />
  );
}
