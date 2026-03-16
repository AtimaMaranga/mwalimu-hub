"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import type { Lesson } from "@/types";
import { useDaily } from "@/hooks/useDaily";
import LessonTimer from "@/components/classroom/LessonTimer";
import WalletHeartbeat from "@/components/classroom/WalletHeartbeat";
import ControlBar from "@/components/classroom/ControlBar";

const VideoPanel = lazy(() => import("@/components/classroom/VideoPanel"));
const Whiteboard = lazy(() => import("@/components/classroom/Whiteboard"));
const NounClassSidebar = lazy(() => import("@/components/classroom/NounClassSidebar"));

const FREE_TRIAL_SECONDS = 600;

interface ClassroomClientProps {
  lesson: Lesson;
  partnerName: string;
  walletBalance: number;
  role: "student" | "teacher";
  isFirstSession: boolean;
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
}: ClassroomClientProps) {
  const router = useRouter();
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [lessonEnded, setLessonEnded] = useState(false);

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
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Error banner */}
      {daily.error && (
        <div className="bg-red-600 text-white text-sm text-center px-4 py-2">
          {daily.error}
        </div>
      )}

      {/* Teacher trial banner */}
      {role === "teacher" && isFirstSession && teacherTrialLeft > 0 && (
        <div className="bg-emerald-600 text-white text-sm text-center px-4 py-2 flex items-center justify-center gap-2">
          <Gift className="h-4 w-4" />
          Trial session — student&apos;s first 10 min are free ({formatCountdown(teacherTrialLeft)} remaining)
        </div>
      )}
      {role === "teacher" && isFirstSession && teacherTrialLeft === 0 && (
        <div className="bg-slate-700 text-slate-300 text-sm text-center px-4 py-1.5">
          Trial period ended — normal billing active
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video + Whiteboard */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video */}
          <div className={`${isWhiteboardOpen ? "h-1/2" : "flex-1"} flex p-2`}>
            <Suspense fallback={<div className="flex-1 bg-slate-800 rounded-xl animate-pulse" />}>
              <VideoPanel
                localParticipant={daily.localParticipant}
                remoteParticipant={daily.remoteParticipant}
                isCameraOn={daily.isCameraOn}
                isJoining={daily.isJoining}
                partnerName={partnerName}
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
        </div>

        {/* Right: Noun class sidebar */}
        <div className="w-64 shrink-0 hidden lg:block">
          <Suspense fallback={<div className="h-full bg-slate-800 animate-pulse" />}>
            <NounClassSidebar />
          </Suspense>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Timer & Wallet info */}
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

          {/* Controls */}
          <ControlBar
            isMicOn={daily.isMicOn}
            isCameraOn={daily.isCameraOn}
            isWhiteboardOpen={isWhiteboardOpen}
            onToggleMic={daily.toggleMic}
            onToggleCamera={daily.toggleCamera}
            onToggleWhiteboard={() => setIsWhiteboardOpen((v) => !v)}
            onEndCall={endCall}
          />

          {/* Partner info */}
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{partnerName}</p>
            <p className="text-slate-400 text-xs">Swahili Lesson</p>
          </div>
        </div>
      </div>
    </div>
  );
}
