import { createAdminClient } from "@/lib/supabase/server";

type NotificationType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_declined"
  | "booking_cancelled"
  | "new_message"
  | "lesson_reminder"
  | "lesson_started";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  const admin = await createAdminClient();

  const { error } = await admin.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    link: params.link ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}

/** Resolve auth user ID for a teacher_id (from teachers table) */
export async function getTeacherUserId(teacherId: string): Promise<string | null> {
  const admin = await createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("teacher_id", teacherId)
    .single();
  return data?.id ?? null;
}
