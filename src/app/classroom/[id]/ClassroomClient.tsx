"use client";

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import type { Lesson } from "@/types";
import { useDaily } from "@/hooks/useDaily";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { ViewMode } from "@/components/classroom/VideoPanel";
import LessonTimer from "@/components/classroom/LessonTimer";
import WalletHeartbeat from "@/components/classroom/WalletHeartbeat";
import ControlBar from "@/components/classroom/ControlBar";

const VideoPanel = lazy(() => import("@/components/classroom/VideoPanel"));
const Whiteboard = lazy(() => import("@/components/classroom/Whiteboard"));
const ChatPanel = lazy(() => import("@/components/classroom/ChatPanel"));

const FREE_TRIAL_SECONDS = 600;

interface ClassroomClientProps {
  lesson: Lesson;
  partnerName: string;
  walletBalance: number;
  role: "student" | "teacher";
  isFirstSession: boolean;
  userId: string;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ClassroomClient({
  lesson,
  partnerName,
  walletBalance,
  role,
  isFirstSession,
  userId,
}: ClassroomClientProps) {
  const router = useRouter();
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [lessonEnded, setLessonEnded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Teacher-side free trial countdown
  const [teacherTrialLeft, setTeacherTrialLeft] = useState(() => {
    if (!isFirstSession || role !== "teacher") return 0;
    const elapsed = Math.floor((Date.now() - new Date(lesson.started_at).getTime()) / 1000);
    return Math.max(0, FREE_TRIAL_SECONDS - elapsed);
  });

  useEffect(() => {
    if (role !== "teacher" || !isFirstSession || teacherTrialLeft <= 0) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(lesson.started_at).getTime()) / 1000);
      setTeacherTrialLeft(Math.max(0, FREE_TRIAL_SECONDS - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [role, isFirstSession, lesson.started_at, teacherTrialLeft]);

  const daily = useDaily({ lessonId: lesson.id });

  // Track unread messages when chat is closed
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Listen for new messages to bump unread count when chat is closed
  useEffect(() => {
    if (isChatOpen) return;

    const supabase = createSupabaseClient();
    const channel = supabase
      .channel(`unread-${lesson.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lesson_messages",
          filter: `lesson_id=eq.${lesson.id}`,
        },
        (payload: { new: { sender_id: string } }) => {
          if (payload.new.sender_id !== userId) {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lesson.id, userId, isChatOpen]);

  const endCall = useCallback(async () => {
    try {
      await daily.leave();
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/lessons/${lesson.id}/end`, { method: "PATCH" });
    } catch {
      // ignore
    }

    setLessonEnded(true);
  }, [lesson.id, daily]);

  const onLessonEnded = useCallback(async () => {
    try {
      await daily.leave();
    } catch {
      // ignore
    }
    setLessonEnded(true);
  }, [daily]);

  if (lessonEnded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lesson Ended</h2>
          <p className="text-slate-500 text-sm mb-6">
            Your lesson with {partnerName} has ended. Thank you for learning Swahili!
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Error banner */}
      {daily.error && (
        <div className="bg-red-600 text-white text-sm text-center px-4 py-2 shrink-0">
          {daily.error}
        </div>
      )}

      {/* Teacher trial banner */}
      {role === "teacher" && isFirstSession && teacherTrialLeft > 0 && (
        <div className="bg-emerald-600 text-white text-sm text-center px-4 py-2 flex items-center justify-center gap-2 shrink-0">
          <Gift className="h-4 w-4" />
          Trial session — student&apos;s first 10 min are free ({formatCountdown(teacherTrialLeft)} remaining)
        </div>
      )}
      {role === "teacher" && isFirstSession && teacherTrialLeft === 0 && (
        <div className="bg-slate-700 text-slate-300 text-sm text-center px-4 py-1.5 shrink-0">
          Trial period ended — normal billing active
        </div>
      )}

      {/* Top bar: Timer + Wallet + Partner info */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 shrink-0 z-20">
        <div className="flex items-center gap-4 flex-wrap">
          <LessonTimer startedAt={lesson.started_at} />
          {role === "student" && daily.isJoined && (
            <WalletHeartbeat
              lessonId={lesson.id}
              initialBalance={walletBalance}
              ratePerMinute={lesson.rate_per_minute}
              isFirstSession={isFirstSession}
              lessonStartedAt={lesson.started_at}
              onLessonEnded={onLessonEnded}
            />
          )}
        </div>
        <div className="text-right">
          <p className="text-white text-sm font-semibold">{partnerName}</p>
          <p className="text-slate-400 text-xs">Swahili Lesson</p>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Video + Whiteboard */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Video */}
          <div className={`${isWhiteboardOpen ? "h-1/2" : "flex-1"} flex p-2`}>
            <Suspense fallback={<div className="flex-1 bg-slate-800 rounded-xl animate-pulse" />}>
              <VideoPanel
                localParticipant={daily.localParticipant}
                remoteParticipant={daily.remoteParticipant}
                isCameraOn={daily.isCameraOn}
                isJoining={daily.isJoining}
                partnerName={partnerName}
                viewMode={viewMode}
                activeSpeaker={daily.activeSpeaker}
              />
            </Suspense>
          </div>

          {/* Whiteboard */}
          {isWhiteboardOpen && (
            <div className="h-1/2 border-t border-slate-700 bg-white">
              <Suspense fallback={<div className="h-full bg-slate-100 animate-pulse" />}>
                <Whiteboard />
              </Suspense>
            </div>
          )}

          {/* Control bar (overlays bottom of video area) */}
          <ControlBar
            isMicOn={daily.isMicOn}
            isCameraOn={daily.isCameraOn}
            isWhiteboardOpen={isWhiteboardOpen}
            isChatOpen={isChatOpen}
            viewMode={viewMode}
            unreadCount={unreadCount}
            onToggleMic={daily.toggleMic}
            onToggleCamera={daily.toggleCamera}
            onToggleWhiteboard={() => setIsWhiteboardOpen((v) => !v)}
            onToggleChat={() => setIsChatOpen((v) => !v)}
            onToggleView={() => setViewMode((v) => v === "gallery" ? "speaker" : "gallery")}
            onOpenFiles={() => {
              // Open chat panel and trigger file input
              setIsChatOpen(true);
            }}
            onEndCall={endCall}
          />
        </div>

        {/* Right: Chat panel (desktop: side panel, mobile: overlay) */}
        {isChatOpen && (
          <>
            {/* Desktop: side panel */}
            <div className="hidden md:block w-80 shrink-0">
              <Suspense fallback={<div className="h-full bg-slate-800 animate-pulse" />}>
                <ChatPanel
                  lessonId={lesson.id}
                  userId={userId}
                  role={role}
                  partnerName={partnerName}
                  onClose={() => setIsChatOpen(false)}
                />
              </Suspense>
            </div>

            {/* Mobile: full-screen overlay */}
            <div className="md:hidden fixed inset-0 z-40 bg-slate-900">
              <Suspense fallback={<div className="h-full bg-slate-800 animate-pulse" />}>
                <ChatPanel
                  lessonId={lesson.id}
                  userId={userId}
                  role={role}
                  partnerName={partnerName}
                  onClose={() => setIsChatOpen(false)}
                />
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
