"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface IncomingCall {
  notificationId: string;
  lessonId: string;
  title: string;
  body: string;
}

export default function IncomingCallOverlay() {
  const router = useRouter();
  const [call, setCall] = useState<IncomingCall | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Poll for lesson_started notifications every 3 seconds for fast response
  const checkForCalls = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=5&unread=true");
      if (!res.ok) return;
      const data = await res.json();
      const notifications = data.notifications ?? [];

      // Find the most recent lesson_started notification that hasn't been dismissed
      const callNotif = notifications.find(
        (n: any) =>
          n.type === "lesson_started" &&
          !n.is_read &&
          !dismissed.has(n.id)
      );

      if (callNotif && !call) {
        setCall({
          notificationId: callNotif.id,
          lessonId: callNotif.metadata?.lesson_id ?? "",
          title: callNotif.title,
          body: callNotif.body,
        });
      }
    } catch {
      // ignore
    }
  }, [call, dismissed]);

  // Fast polling for incoming calls
  useEffect(() => {
    checkForCalls();
    const interval = setInterval(checkForCalls, 3000);
    return () => clearInterval(interval);
  }, [checkForCalls]);

  // Also subscribe to Supabase Realtime for instant notifications
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("incoming-calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const notif = payload.new as any;
          if (
            notif.type === "lesson_started" &&
            !notif.is_read &&
            !dismissed.has(notif.id)
          ) {
            setCall({
              notificationId: notif.id,
              lessonId: notif.metadata?.lesson_id ?? "",
              title: notif.title,
              body: notif.body,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dismissed]);

  // Auto-dismiss after 60 seconds
  useEffect(() => {
    if (call) {
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, 60_000);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [call]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId }),
      });
    } catch {
      // ignore
    }
  };

  const handleJoin = useCallback(() => {
    if (!call) return;
    markAsRead(call.notificationId);
    const lessonId = call.lessonId;
    setCall(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push(`/classroom/${lessonId}`);
  }, [call, router]);

  const handleDismiss = useCallback(() => {
    if (!call) return;
    markAsRead(call.notificationId);
    setDismissed((prev) => new Set(prev).add(call.notificationId));
    setCall(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [call]);

  if (!call || !call.lessonId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-6 pt-8 pb-10 text-center relative">
          {/* Animated rings */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: "1.5s" }} />
            <div className="absolute -inset-3 rounded-full bg-white/10 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto">
              <Video className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="text-white text-xl font-bold mb-1">{call.title}</h2>
          <p className="text-indigo-200 text-sm">{call.body}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-6 flex items-center justify-center gap-6">
          {/* Decline */}
          <button
            onClick={handleDismiss}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <PhoneOff className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500">Dismiss</span>
          </button>

          {/* Accept */}
          <button
            onClick={handleJoin}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 animate-pulse">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-bold text-emerald-600">Join Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
