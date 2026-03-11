"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ChatWindow from "./ChatWindow";
import type { Conversation } from "@/types";

interface ConversationInboxProps {
  currentUserId: string;
  userRole: "student" | "teacher";
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

/** Is the person considered online? Teachers use is_online; students use last_seen within 5 min */
function resolveOnline(conv: Conversation, role: "student" | "teacher"): boolean {
  if (role === "student") {
    // Student is viewing a teacher → show teacher's is_online
    return conv.teacher_is_online ?? false;
  } else {
    // Teacher is viewing a student → online if last_seen within 5 min
    if (!conv.student_last_seen_at) return false;
    return Date.now() - new Date(conv.student_last_seen_at).getTime() < 5 * 60 * 1000;
  }
}

function playInboxSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [440, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch { /* ignore */ }
}

export default function ConversationInbox({ currentUserId, userRole }: ConversationInboxProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const prevUnreadTotal = useRef(0);
  const isFirstLoad = useRef(true);

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      const incoming: Conversation[] = data.conversations ?? [];

      if (!isFirstLoad.current) {
        const newTotal = incoming.reduce(
          (sum, c) => sum + (userRole === "student" ? c.student_unread : c.teacher_unread), 0
        );
        if (newTotal > prevUnreadTotal.current) playInboxSound();
        prevUnreadTotal.current = newTotal;
      } else {
        prevUnreadTotal.current = incoming.reduce(
          (sum, c) => sum + (userRole === "student" ? c.student_unread : c.teacher_unread), 0
        );
        isFirstLoad.current = false;
      }

      setConversations(incoming);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userRole]);

  useEffect(() => { fetchConversations(false); }, [fetchConversations]);

  // Realtime — refetch on any conversation change
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("inbox:conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  // Polling fallback every 5s
  useEffect(() => {
    const interval = setInterval(() => fetchConversations(true), 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const getUnreadCount = (c: Conversation) =>
    userRole === "student" ? c.student_unread : c.teacher_unread;

  const getRecipientName = (c: Conversation) =>
    userRole === "student" ? c.teacher_name : c.student_name;

  const handleOpen = useCallback((conv: Conversation) => {
    setActiveConversation(conv);
    setConversations((prev) =>
      prev.map((c) => c.id !== conv.id ? c : userRole === "student"
        ? { ...c, student_unread: 0 }
        : { ...c, teacher_unread: 0 }
      )
    );
    fetch(`/api/conversations/${conv.id}/read`, { method: "PATCH" }).catch(() => {});
  }, [userRole]);

  const totalUnread = conversations.reduce((sum, c) => sum + getUnreadCount(c), 0);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Messages</p>
              <p className="text-xs text-slate-400">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {totalUnread > 0 && (
            <span className="h-6 min-w-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full bg-slate-200 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
              <MessageCircle className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="text-slate-900 font-semibold mb-1">No messages yet</p>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              {userRole === "student"
                ? "Visit a teacher's profile and click 'Message' to start a conversation."
                : "When students message you, conversations will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {conversations.map((conv) => {
              const recipientName = getRecipientName(conv);
              const unread = getUnreadCount(conv);
              const isActive = activeConversation?.id === conv.id;
              const isOnline = resolveOnline(conv, userRole);

              return (
                <button
                  key={conv.id}
                  onClick={() => handleOpen(conv)}
                  className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-colors text-left ${isActive ? "bg-indigo-50/50" : ""}`}
                >
                  {/* Avatar with online dot */}
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(recipientName)}
                    </div>
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-sm truncate ${unread > 0 ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                          {recipientName}
                        </p>
                        <span className={`text-[10px] font-medium shrink-0 ${isOnline ? "text-emerald-600" : "text-slate-400"}`}>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatTimeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${unread > 0 ? "text-slate-600" : "text-slate-400"}`}>
                        {conv.last_message ?? "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat window */}
      {activeConversation && (
        <ChatWindow
          conversationId={activeConversation.id}
          currentUserId={currentUserId}
          currentUserRole={userRole}
          recipientName={getRecipientName(activeConversation)}
          recipientIsOnline={resolveOnline(activeConversation, userRole)}
          onClose={() => setActiveConversation(null)}
        />
      )}
    </>
  );
}
