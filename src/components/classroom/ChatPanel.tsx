"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, X, FileText, Image, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  lesson_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

interface ChatPanelProps {
  lessonId: string;
  userId: string;
  role: "student" | "teacher";
  partnerName: string;
  onClose: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatPanel({
  lessonId,
  userId,
  role,
  partnerName,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial messages
  useEffect(() => {
    fetch(`/api/lessons/${lessonId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch(() => {});
  }, [lessonId]);

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`lesson-chat-${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lesson_messages",
          filter: `lesson_id=eq.${lessonId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (content?: string, fileData?: { file_url: string; file_name: string; file_type: string }) => {
      if (!content?.trim() && !fileData) return;

      setSending(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content?.trim() || null,
            ...fileData,
          }),
        });
        if (res.ok) {
          setInput("");
        }
      } catch {
        // Will retry
      } finally {
        setSending(false);
      }
    },
    [lessonId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    sendMessage(input);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File must be under 10MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${lessonId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("lesson-files")
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("lesson-files")
        .getPublicUrl(path);

      await sendMessage(undefined, {
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
      });
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isImage = (type: string | null) =>
    type?.startsWith("image/");

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div>
          <h3 className="text-white text-sm font-semibold">Chat</h3>
          <p className="text-slate-400 text-xs">with {partnerName}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs text-center mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  isMine
                    ? role === "teacher"
                      ? "bg-teal-600 text-white"
                      : "bg-indigo-600 text-white"
                    : "bg-slate-700 text-slate-100"
                }`}
              >
                {/* File attachment */}
                {msg.file_url && (
                  <div className="mb-1">
                    {isImage(msg.file_type) ? (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.file_url}
                          alt={msg.file_name || "Image"}
                          className="max-w-full rounded-lg max-h-48 object-cover"
                        />
                      </a>
                    ) : (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                          isMine ? "bg-white/10" : "bg-slate-600"
                        }`}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate flex-1">
                          {msg.file_name || "File"}
                        </span>
                        <Download className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                )}

                {/* Text content */}
                {msg.content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}

                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-white/60" : "text-slate-400"
                  }`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-700 px-3 py-2 flex items-center gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.txt,.mp3,.mp4"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          title="Attach file"
        >
          {uploading ? (
            <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
          className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
