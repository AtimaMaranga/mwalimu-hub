"use client";

import { useEffect, useState, useCallback } from "react";
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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ConversationInbox({
  currentUserId,
  userRole,
}: ConversationInboxProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription on conversations table
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("inbox:conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const updated = payload.new as Conversation;
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === updated.id);
            if (exists) {
              return prev.map((c) => (c.id === updated.id ? updated : c));
            }
            return [updated, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenConversation = useCallback(
    (conv: Conversation) => {
      setActiveConversation(conv);
      // Reset unread count in local state immediately
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conv.id) return c;
          return userRole === "student"
            ? { ...c, student_unread: 0 }
            : { ...c, teacher_unread: 0 };
        })
      );
    },
    [userRole]
  );

  const getUnreadCount = (conv: Conversation): number => {
    return userRole === "student" ? conv.student_unread : conv.teacher_unread;
  };

  const getRecipientName = (conv: Conversation): string => {
    return userRole === "student" ? conv.teacher_name : conv.student_name;
  };

  return (
    <>
      <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="h-4 w-4 text-cyan-400" />
            <p className="text-sm font-semibold text-white">Messages</p>
            {conversations.length > 0 && (
              <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
            )}
          </div>
          {conversations.some((c) => getUnreadCount(c) > 0) && (
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-slate-600 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
              <MessageCircle className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-white font-semibold mb-1">No messages yet</p>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              {userRole === "student"
                ? "Visit a teacher's profile and click 'Message' to start a conversation."
                : "When students message you, conversations will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {conversations.map((conv) => {
              const recipientName = getRecipientName(conv);
              const unread = getUnreadCount(conv);
              const isActive = activeConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv)}
                  className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-white/3 transition-colors text-left ${
                    isActive ? "bg-white/5" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(recipientName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p
                        className={`text-sm font-semibold truncate ${
                          unread > 0 ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {recipientName}
                      </p>
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {formatTimeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 truncate">
                        {conv.last_message ?? "No messages yet"}
                      </p>
                      {unread > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
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
          onClose={() => setActiveConversation(null)}
        />
      )}
    </>
  );
}
