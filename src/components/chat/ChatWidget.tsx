"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatWindow from "./ChatWindow";
import type { Conversation } from "@/types";

interface ChatWidgetProps {
  teacher: { id: string; name: string; slug: string; is_online: boolean };
  currentUserId: string | null;
  currentUserName: string | null;
  currentUserEmail: string | null;
}

export default function ChatWidget({
  teacher,
  currentUserId,
  currentUserName: _currentUserName,
  currentUserEmail: _currentUserEmail,
}: ChatWidgetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (!currentUserId) {
      router.push(`/auth/login?next=/teachers/${teacher.slug}`);
      return;
    }

    if (conversation) {
      setChatOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: teacher.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setChatOpen(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not open chat. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p className="text-red-600 text-xs mt-2 mb-1">{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {loading ? (
          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        {loading ? "Opening..." : `Message ${teacher.name.split(" ")[0]}`}
      </button>

      {chatOpen && conversation && (
        <ChatWindow
          conversationId={conversation.id}
          currentUserId={currentUserId!}
          currentUserRole="student"
          recipientName={teacher.name}
          recipientIsOnline={teacher.is_online}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}
