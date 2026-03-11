"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: "student" | "teacher";
  recipientName: string;
  recipientIsOnline?: boolean;
  onClose: () => void;
}

function formatMessageTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
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

export default function ChatWindow({
  conversationId,
  currentUserId,
  currentUserRole: _currentUserRole,
  recipientName,
  recipientIsOnline = false,
  onClose,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(
          `/api/messages?conversationId=${conversationId}`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Mark as read
    fetch(`/api/conversations/${conversationId}/read`, {
      method: "PATCH",
    }).catch(() => {});
  }, [conversationId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channelName = `chat:${conversationId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        if ((payload.payload as { sender_id?: string })?.sender_id !== currentUserId) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Send typing broadcast
  const handleTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { sender_id: currentUserId },
      });
    }
  }, [currentUserId]);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setInputValue("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        const newMessage = data.message as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [inputValue, sending, conversationId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
        onClick={onClose}
      />

      {/* Chat panel */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end pointer-events-none">
        <div className="pointer-events-auto w-full sm:w-96 h-[85vh] sm:h-[600px] sm:mr-6 sm:mb-6 bg-[#13141f] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/10">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#1a1b2e] shrink-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(recipientName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{recipientName}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    recipientIsOnline ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                />
                <span className="text-xs text-slate-400">
                  {recipientIsOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
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
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Start the conversation</p>
                <p className="text-slate-600 text-xs">
                  Say hello to {recipientName}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {!isOwn && (
                        <span className="text-xs text-slate-500 px-1">
                          {msg.sender_name}
                        </span>
                      )}
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isOwn
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-[#252640] text-slate-100 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-600 px-1">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-slate-500 px-1">{recipientName}</span>
                    <div className="bg-[#252640] px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="shrink-0 px-4 py-3 border-t border-white/10 bg-[#1a1b2e]">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-[#13141f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors leading-relaxed"
                style={{ minHeight: "40px", maxHeight: "120px" }}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sending}
                className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
