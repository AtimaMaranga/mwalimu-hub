"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays, Clock, PlayCircle, X, ChevronRight,
  Video, MessageCircle, User,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface SessionBooking {
  id: string;
  proposed_date: string;
  proposed_time: string;
  duration_minutes: number;
  status: string;
  message?: string;
  teacher_note?: string;
  teachers?: { name: string; slug: string; profile_image_url?: string };
  profiles?: { full_name?: string };
}

interface UpcomingSessionsProps {
  bookings: SessionBooking[];
  role: "student" | "teacher";
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

function isSessionToday(dateStr: string): boolean {
  const proposed = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.abs(proposed.getTime() - today.getTime()) <= 86400000;
}

function getTimeUntil(dateStr: string, timeStr: string): string {
  const sessionDate = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const diff = sessionDate.getTime() - now.getTime();

  if (diff < 0) return "Starting now";
  if (diff < 3600000) return `in ${Math.ceil(diff / 60000)} min`;
  if (diff < 86400000) return `in ${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  const days = Math.ceil(diff / 86400000);
  return `in ${days} day${days !== 1 ? "s" : ""}`;
}

function SessionCard({
  booking,
  role,
}: {
  booking: SessionBooking;
  role: "student" | "teacher";
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const isToday = isSessionToday(booking.proposed_date);
  const timeUntil = getTimeUntil(booking.proposed_date, booking.proposed_time);
  const personName =
    role === "student"
      ? booking.teachers?.name ?? "Teacher"
      : booking.profiles?.full_name ?? "Student";
  const personInitials = getInitials(personName);
  const profileImage = role === "student" ? booking.teachers?.profile_image_url : undefined;
  const teacherSlug = booking.teachers?.slug;

  const handleJoin = async () => {
    setLoading("join");
    setError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}/start-lesson`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.lesson_id) {
          router.push(`/classroom/${data.lesson_id}`);
          return;
        }
        setError(data.error || "Failed to start lesson");
        return;
      }
      router.push(`/classroom/${data.lesson.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading("");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    setLoading("cancel");
    setError("");
    try {
      const endpoint =
        role === "student"
          ? `/api/bookings/${booking.id}/cancel`
          : `/api/bookings/${booking.id}/respond`;
      const options: RequestInit =
        role === "student"
          ? { method: "PATCH" }
          : {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "decline" }),
            };
      const res = await fetch(endpoint, options);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to cancel");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading("");
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isToday
          ? "border-indigo-200 bg-indigo-50/50 shadow-sm shadow-indigo-100"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      {/* Main row — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        {/* Avatar */}
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
          {profileImage ? (
            <img src={profileImage} alt={personName} className="h-full w-full object-cover" />
          ) : (
            personInitials
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-slate-900 truncate">{personName}</p>
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Today
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatSessionDate(booking.proposed_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(booking.proposed_time)} · {booking.duration_minutes} min
            </span>
          </div>
        </div>

        {/* Time until + expand */}
        <div className="text-right shrink-0">
          <p className={`text-xs font-semibold ${isToday ? "text-indigo-600" : "text-slate-500"}`}>
            {timeUntil}
          </p>
          <ChevronRight
            className={`h-4 w-4 text-slate-300 mx-auto mt-1 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4 space-y-3">
          {/* Session details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatSessionDate(booking.proposed_date)}
              </p>
              <p className="text-xs text-slate-500">
                {formatTime(booking.proposed_time)} — {booking.duration_minutes} minutes
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {role === "student" ? "Teacher" : "Student"}
              </p>
              <p className="text-sm font-semibold text-slate-800">{personName}</p>
              {role === "student" && teacherSlug && (
                <a
                  href={`/teachers/${teacherSlug}`}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  View profile →
                </a>
              )}
            </div>
          </div>

          {/* Message from student */}
          {booking.message && (
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> Student&apos;s Message
              </p>
              <p className="text-sm text-slate-600">{booking.message}</p>
            </div>
          )}

          {/* Teacher note */}
          {booking.teacher_note && (
            <div className="rounded-lg bg-emerald-50 p-3">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Teacher&apos;s Note
              </p>
              <p className="text-sm text-emerald-800">{booking.teacher_note}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {isToday && booking.status === "confirmed" && (
              <button
                onClick={handleJoin}
                disabled={!!loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Video className="h-4 w-4" />
                {loading === "join" ? "Joining..." : "Join Classroom"}
              </button>
            )}
            {["pending", "confirmed"].includes(booking.status) && (
              <button
                onClick={handleCancel}
                disabled={!!loading}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isToday && booking.status === "confirmed"
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                <X className="h-3.5 w-3.5" />
                {loading === "cancel" ? "Cancelling..." : "Cancel Session"}
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function UpcomingSessions({ bookings, role }: UpcomingSessionsProps) {
  // Only show confirmed bookings with future or today dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings
    .filter((b) => {
      if (b.status !== "confirmed") return false;
      const bDate = new Date(b.proposed_date + "T00:00:00");
      return bDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.proposed_date}T${a.proposed_time}`);
      const dateB = new Date(`${b.proposed_date}T${b.proposed_time}`);
      return dateA.getTime() - dateB.getTime();
    });

  if (upcoming.length === 0) return null;

  const todaySessions = upcoming.filter((b) => isSessionToday(b.proposed_date));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Video className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Upcoming Sessions</p>
            <p className="text-xs text-slate-400">
              {upcoming.length} session{upcoming.length !== 1 ? "s" : ""} scheduled
              {todaySessions.length > 0 && (
                <> · <span className="text-indigo-600 font-semibold">{todaySessions.length} today</span></>
              )}
            </p>
          </div>
        </div>
        {todaySessions.length > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Session today
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {upcoming.map((booking) => (
          <SessionCard key={booking.id} booking={booking} role={role} />
        ))}
      </div>
    </div>
  );
}
