"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, X, Check, CheckCheck, CalendarPlus, CalendarCheck,
  CalendarX, MessageCircle, Clock, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const POLL_INTERVAL = 20_000;

const typeIcons: Record<string, { icon: typeof Bell; bg: string; color: string }> = {
  booking_created:   { icon: CalendarPlus,  bg: "bg-indigo-50",  color: "text-indigo-600" },
  booking_confirmed: { icon: CalendarCheck, bg: "bg-emerald-50", color: "text-emerald-600" },
  booking_declined:  { icon: CalendarX,     bg: "bg-red-50",     color: "text-red-500" },
  booking_cancelled: { icon: CalendarX,     bg: "bg-amber-50",   color: "text-amber-600" },
  new_message:       { icon: MessageCircle, bg: "bg-blue-50",    color: "text-blue-600" },
  lesson_reminder:   { icon: Clock,         bg: "bg-violet-50",  color: "text-violet-600" },
  lesson_started:    { icon: Video,         bg: "bg-emerald-50", color: "text-emerald-600" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      // ignore
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notification_id: id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    setLoading(true);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all_read: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.link) router.push(n.link);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shrink-0"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              {unreadCount > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 px-6">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You&apos;ll be notified about bookings and messages here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const typeInfo = typeIcons[n.type] ?? typeIcons.booking_created;
                const Icon = typeInfo.icon;

                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0",
                      !n.is_read && "bg-indigo-50/30"
                    )}
                  >
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", typeInfo.bg)}>
                      <Icon className={cn("h-4 w-4", typeInfo.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          n.is_read ? "text-slate-700" : "text-slate-900 font-semibold"
                        )}>
                          {n.title}
                        </p>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
