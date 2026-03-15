"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays, Clock, X, ChevronRight, ChevronDown,
  Video, MessageCircle, Check, PlayCircle, AlertCircle,
  Bell, RefreshCw,
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
  created_at: string;
  teachers?: { name: string; slug: string; profile_image_url?: string };
  profiles?: { full_name?: string };
}

interface ScheduledSessionsProps {
  bookings: SessionBooking[];
  role: "student" | "teacher";
}

const POLL_INTERVAL = 15_000; // 15 seconds

type TabKey = "upcoming" | "pending" | "past";

/* ─── Helpers ─── */

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
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

  if (diff < 0) return "Started";
  if (diff < 3600000) return `in ${Math.ceil(diff / 60000)} min`;
  if (diff < 86400000) return `in ${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  const days = Math.ceil(diff / 86400000);
  return `in ${days} day${days !== 1 ? "s" : ""}`;
}

function isFutureOrToday(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   label: "Awaiting confirmation" },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Confirmed" },
  declined:  { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     label: "Declined" },
  cancelled: { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400",   label: "Cancelled" },
  completed: { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-500",  label: "Completed" },
};

/* ─── Session Card ─── */

function SessionCard({
  booking,
  role,
  showStatus,
}: {
  booking: SessionBooking;
  role: "student" | "teacher";
  showStatus?: boolean;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const isToday = isSessionToday(booking.proposed_date);
  const isFuture = isFutureOrToday(booking.proposed_date);
  const personName =
    role === "student"
      ? booking.teachers?.name ?? "Teacher"
      : booking.profiles?.full_name ?? "Student";
  const personInitials = getInitials(personName);
  const profileImage = role === "student" ? booking.teachers?.profile_image_url : undefined;
  const teacherSlug = booking.teachers?.slug;
  const sc = statusConfig[booking.status] ?? statusConfig.cancelled;

  const handleJoin = async () => {
    setLoading("join");
    setError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}/start-lesson`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.lesson_id) { router.push(`/classroom/${data.lesson_id}`); return; }
        setError(data.error || "Failed to start lesson");
        return;
      }
      router.push(`/classroom/${data.lesson.id}`);
    } catch { setError("Network error"); }
    finally { setLoading(""); }
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
          : { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "decline" }) };
      const res = await fetch(endpoint, options);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to cancel");
        return;
      }
      router.refresh();
    } catch { setError("Network error"); }
    finally { setLoading(""); }
  };

  const handleRespond = async (action: "confirm" | "decline") => {
    setLoading(action);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed");
        return;
      }
      router.refresh();
    } catch { setError("Network error"); }
    finally { setLoading(""); }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isToday && booking.status === "confirmed"
          ? "border-indigo-200 bg-indigo-50/30 shadow-sm shadow-indigo-100"
          : booking.status === "pending"
          ? "border-amber-200 bg-amber-50/20"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4"
      >
        {/* Avatar */}
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0 overflow-hidden">
          {profileImage ? (
            <img src={profileImage} alt={personName} className="h-full w-full object-cover" />
          ) : personInitials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">{personName}</p>
            {isToday && booking.status === "confirmed" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Today
              </span>
            )}
            {showStatus && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text} shrink-0`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3 shrink-0" />
              {formatSessionDate(booking.proposed_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {formatTime(booking.proposed_time)} · {booking.duration_minutes} min
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          {isFuture && booking.status === "confirmed" && (
            <p className={`text-xs font-semibold ${isToday ? "text-indigo-600" : "text-slate-500"}`}>
              {getTimeUntil(booking.proposed_date, booking.proposed_time)}
            </p>
          )}
          <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 border-t border-slate-100 pt-4 space-y-3">
          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-sm font-semibold text-slate-800">{formatSessionDate(booking.proposed_date)}</p>
              <p className="text-xs text-slate-500">{formatTime(booking.proposed_time)} — {booking.duration_minutes} minutes</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {role === "student" ? "Teacher" : "Student"}
              </p>
              <p className="text-sm font-semibold text-slate-800">{personName}</p>
              {role === "student" && teacherSlug && (
                <a href={`/teachers/${teacherSlug}`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" onClick={e => e.stopPropagation()}>
                  View profile →
                </a>
              )}
            </div>
          </div>

          {/* Status info */}
          <div className={`rounded-lg p-3 flex items-center gap-2 ${sc.bg}`}>
            <span className={`h-2 w-2 rounded-full ${sc.dot} shrink-0`} />
            <p className={`text-xs font-semibold ${sc.text}`}>{sc.label}</p>
            {booking.status === "pending" && role === "student" && (
              <p className="text-xs text-slate-500 ml-1">— waiting for the teacher to confirm</p>
            )}
            {booking.status === "pending" && role === "teacher" && (
              <p className="text-xs text-slate-500 ml-1">— please confirm or decline this request</p>
            )}
          </div>

          {/* Student message */}
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
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Teacher&apos;s Note</p>
              <p className="text-sm text-emerald-800">{booking.teacher_note}</p>
            </div>
          )}

          {/* Classroom link info for confirmed sessions */}
          {booking.status === "confirmed" && isFuture && (
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 flex items-start gap-2.5">
              <Video className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-indigo-800">Classroom Access</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  {isToday
                    ? "Your classroom is ready. Click \"Join Classroom\" below to enter."
                    : `The "Join Classroom" button will appear on the day of the session (${formatSessionDate(booking.proposed_date)}).`}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {/* Confirmed + today → Join */}
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

            {/* Teacher actions for pending */}
            {booking.status === "pending" && role === "teacher" && (
              <>
                <button
                  onClick={() => handleRespond("confirm")}
                  disabled={!!loading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  {loading === "confirm" ? "Confirming..." : "Confirm"}
                </button>
                <button
                  onClick={() => handleRespond("decline")}
                  disabled={!!loading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  {loading === "decline" ? "..." : "Decline"}
                </button>
              </>
            )}

            {/* Cancel for pending/confirmed */}
            {["pending", "confirmed"].includes(booking.status) && !(booking.status === "pending" && role === "teacher") && (
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

/* ─── Empty State ─── */

function EmptyState({ tab, role }: { tab: TabKey; role: string }) {
  const content = {
    upcoming: {
      icon: <Video className="h-7 w-7 text-indigo-400" />,
      title: "No upcoming sessions",
      description: role === "student"
        ? "Once a teacher confirms your booking, your session will appear here."
        : "Confirmed sessions with students will appear here.",
      cta: role === "student" ? { label: "Find a Teacher", href: "/teachers" } : null,
    },
    pending: {
      icon: <Clock className="h-7 w-7 text-amber-400" />,
      title: "No pending requests",
      description: role === "student"
        ? "When you book a lesson, it will show here until the teacher confirms."
        : "Student booking requests will appear here for you to confirm or decline.",
      cta: role === "student" ? { label: "Book a Lesson", href: "/teachers" } : null,
    },
    past: {
      icon: <CalendarDays className="h-7 w-7 text-slate-300" />,
      title: "No past sessions",
      description: "Your completed, cancelled, and declined sessions will appear here.",
      cta: null,
    },
  };

  const c = content[tab];

  return (
    <div className="text-center py-10 px-6">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 mb-3">
        {c.icon}
      </div>
      <p className="text-slate-900 font-semibold text-sm mb-1">{c.title}</p>
      <p className="text-slate-400 text-xs max-w-xs mx-auto mb-4">{c.description}</p>
      {c.cta && (
        <Link
          href={c.cta.href}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          {c.cta.label} <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function ScheduledSessions({ bookings: initialBookings, role }: ScheduledSessionsProps) {
  const [bookings, setBookings] = useState<SessionBooking[]>(initialBookings);
  const [newBookingAlert, setNewBookingAlert] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const knownIdsRef = useRef<Set<string>>(new Set(initialBookings.map(b => b.id)));
  const router = useRouter();

  // Poll for new bookings
  const fetchBookings = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/bookings?role=${role}`);
      if (!res.ok) return;
      const data = await res.json();
      const fetched: SessionBooking[] = data.bookings ?? [];

      // Detect new bookings
      const newOnes = fetched.filter(b => !knownIdsRef.current.has(b.id));
      if (newOnes.length > 0) {
        const personName = role === "teacher"
          ? newOnes[0].profiles?.full_name ?? "A student"
          : newOnes[0].teachers?.name ?? "A teacher";
        setNewBookingAlert(
          newOnes.length === 1
            ? `New session request from ${personName}`
            : `${newOnes.length} new session requests`
        );
        // Auto-dismiss after 8 seconds
        setTimeout(() => setNewBookingAlert(null), 8000);
      }

      // Update known IDs
      knownIdsRef.current = new Set(fetched.map(b => b.id));
      setBookings(fetched);
    } catch {
      // Silently ignore polling errors
    } finally {
      if (showRefreshIndicator) setIsRefreshing(false);
    }
  }, [role]);

  // Start polling
  useEffect(() => {
    const interval = setInterval(() => fetchBookings(false), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Sync when initial bookings change (e.g. router.refresh)
  useEffect(() => {
    setBookings(initialBookings);
    knownIdsRef.current = new Set(initialBookings.map(b => b.id));
  }, [initialBookings]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings
    .filter(b => b.status === "confirmed" && isFutureOrToday(b.proposed_date))
    .sort((a, b) => new Date(`${a.proposed_date}T${a.proposed_time}`).getTime() - new Date(`${b.proposed_date}T${b.proposed_time}`).getTime());

  const pending = bookings
    .filter(b => b.status === "pending")
    .sort((a, b) => new Date(`${a.proposed_date}T${a.proposed_time}`).getTime() - new Date(`${b.proposed_date}T${b.proposed_time}`).getTime());

  const past = bookings
    .filter(b =>
      ["completed", "declined", "cancelled"].includes(b.status) ||
      (b.status === "confirmed" && !isFutureOrToday(b.proposed_date))
    )
    .sort((a, b) => new Date(`${b.proposed_date}T${b.proposed_time}`).getTime() - new Date(`${a.proposed_date}T${a.proposed_time}`).getTime());

  const todaySessions = upcoming.filter(b => isSessionToday(b.proposed_date));

  // Default to pending tab for teachers if they have pending requests, otherwise upcoming
  const defaultTab: TabKey = role === "teacher" && pending.length > 0 && upcoming.length === 0 ? "pending" : "upcoming";
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // Auto-switch to pending tab when new pending bookings arrive (for teachers)
  useEffect(() => {
    if (role === "teacher" && newBookingAlert && pending.length > 0) {
      setActiveTab("pending");
    }
  }, [newBookingAlert, pending.length, role]);

  const tabs: { key: TabKey; label: string; count: number; alert?: boolean }[] = [
    { key: "upcoming", label: "Upcoming", count: upcoming.length, alert: todaySessions.length > 0 },
    { key: "pending", label: "Pending", count: pending.length, alert: pending.length > 0 },
    { key: "past", label: "Past", count: past.length },
  ];

  const currentList = activeTab === "upcoming" ? upcoming : activeTab === "pending" ? pending : past;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* New booking alert banner */}
      {newBookingAlert && (
        <div className="px-4 py-3 bg-indigo-600 text-white flex items-center justify-between gap-3 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 shrink-0" />
            <p className="text-sm font-semibold">{newBookingAlert}</p>
          </div>
          <button
            onClick={() => setNewBookingAlert(null)}
            className="text-indigo-200 hover:text-white shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Scheduled Sessions</p>
              <p className="text-xs text-slate-400">
                {upcoming.length} upcoming · {pending.length} pending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchBookings(true)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
              title="Refresh bookings"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            {todaySessions.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                {todaySessions.length} today
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key
                    ? tab.alert
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-600"
                    : tab.alert
                    ? "bg-amber-200 text-amber-800"
                    : "bg-slate-200 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {currentList.length === 0 ? (
        <EmptyState tab={activeTab} role={role} />
      ) : (
        <div className="p-4 space-y-3">
          {currentList.map(booking => (
            <SessionCard
              key={booking.id}
              booking={booking}
              role={role}
              showStatus={activeTab === "past"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
