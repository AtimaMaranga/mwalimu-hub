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
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // silently ignore if audio API unavailable
  }
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
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  const mergeMessages = useCallback((incoming: Message[]) => {
    setMessages((prev) => {
      if (incoming.length === 0) return prev;
      const ids = new Set(prev.map((m) => m.id));
      const added = incoming.filter((m) => !ids.has(m.id));
      if (added.length === 0) return prev;
      // Play sound for incoming messages from others (not on initial load)
      if (!isFirstLoad.current) {
        const fromOthers = added.some((m) => m.sender_id !== currentUserId);
        if (fromOthers) playNotificationSound();
      }
      return [...prev, ...added].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [currentUserId]);

  // Fetch messages
  const fetchMessages = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        const incoming: Message[] = data.messages ?? [];
        if (!silent) {
          setMessages(incoming);
          isFirstLoad.current = false;
          const last = incoming[incoming.length - 1];
          if (last) lastMessageIdRef.current = last.id;
        } else {
          mergeMessages(incoming);
          const last = incoming[incoming.length - 1];
          if (last) lastMessageIdRef.current = last.id;
        }
      }
    } catch {
      // network error — polling will retry
    } finally {
      if (!silent) setLoading(false);
    }
  }, [conversationId, mergeMessages]);

  // Initial load
  useEffect(() => {
    fetchMessages(false);
    fetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" }).catch(() => {});
  }, [conversationId, fetchMessages]);

  // Scroll on message update
  useEffect(() => {
    scrollToBottom(!loading);
  }, [messages, loading, scrollToBottom]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          mergeMessages([payload.new as Message]);
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
  }, [conversationId, currentUserId, mergeMessages]);

  // Polling fallback every 3s (ensures delivery even if realtime fails)
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleTyping = useCallback(() => {
    channelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { sender_id: currentUserId },
    });
  }, [currentUserId]);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    setSending(true);
    setInputValue("");
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      });

      if (res.ok) {
        const data = await res.json();
        mergeMessages([data.message as Message]);
      } else {
        const body = await res.json();
        setError(body.error || "Failed to send. Try again.");
        setInputValue(content); // restore input
      }
    } catch {
      setError("Network error. Please try again.");
      setInputValue(content);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [inputValue, sending, conversationId, mergeMessages]);

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
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
        onClick={onClose}
      />

      {/* Chat panel */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end pointer-events-none">
        <div className="pointer-events-auto w-full sm:w-96 h-[85vh] sm:h-[600px] sm:mr-6 sm:mb-6 bg-white rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(recipientName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-semibold truncate">{recipientName}</p>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${recipientIsOnline ? "bg-emerald-400" : "bg-slate-300"}`} />
                <span className="text-xs text-slate-400">{recipientIsOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-teal-400" />
                </div>
                <p className="text-slate-700 text-sm font-medium">Start the conversation</p>
                <p className="text-slate-400 text-xs">Say hello to {recipientName.split(" ")[0]}</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                      {!isOwn && (
                        <span className="text-xs text-slate-400 px-1">{msg.sender_name}</span>
                      )}
                      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                        isOwn
                          ? "bg-teal-600 text-white rounded-br-sm"
                          : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-400 px-1">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-slate-400 px-1">{recipientName}</span>
                    <div className="bg-white border border-slate-100 shadow-sm px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-colors leading-relaxed"
                style={{ minHeight: "40px", maxHeight: "120px" }}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sending}
                className="h-10 w-10 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                aria-label="Send message"
              >
                {sending
                  ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <Send className="h-4 w-4 text-white" />
                }
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
