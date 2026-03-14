"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/types";
import LessonTimer from "@/components/classroom/LessonTimer";
import WalletHeartbeat from "@/components/classroom/WalletHeartbeat";
import ControlBar from "@/components/classroom/ControlBar";

const VideoPanel = lazy(() => import("@/components/classroom/VideoPanel"));
const Whiteboard = lazy(() => import("@/components/classroom/Whiteboard"));
const NounClassSidebar = lazy(() => import("@/components/classroom/NounClassSidebar"));

interface ClassroomClientProps {
  lesson: Lesson;
  teacherName: string;
  walletBalance: number;
}

export default function ClassroomClient({
  lesson,
  teacherName,
  walletBalance,
}: ClassroomClientProps) {
  const router = useRouter();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [lessonEnded, setLessonEnded] = useState(false);

  // Request media on mount
  useEffect(() => {
    let stream: MediaStream | null = null;

    const initMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      } catch {
        // User denied camera/mic — continue without
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleMic = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsMicOn((v) => !v);
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsCameraOn((v) => !v);
  }, [localStream]);

  const endCall = useCallback(async () => {
    try {
      await fetch(`/api/lessons/${lesson.id}/end`, { method: "PATCH" });
    } catch {
      // ignore
    }

    // Stop media tracks
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }

    setLessonEnded(true);
  }, [lesson.id, localStream]);

  const onLessonEnded = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    setLessonEnded(true);
  }, [localStream]);

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
            Your lesson with {teacherName} has ended. Thank you for learning Swahili!
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
      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video + Whiteboard */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video */}
          <div className={`${isWhiteboardOpen ? "h-1/2" : "flex-1"} flex p-2`}>
            <Suspense fallback={<div className="flex-1 bg-slate-800 rounded-xl animate-pulse" />}>
              <VideoPanel
                lessonId={lesson.id}
                localStream={localStream}
                isCameraOn={isCameraOn}
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
          <div className="flex items-center gap-4">
            <LessonTimer startedAt={lesson.started_at} />
            <WalletHeartbeat
              lessonId={lesson.id}
              initialBalance={walletBalance}
              ratePerMinute={lesson.rate_per_minute}
              onLessonEnded={onLessonEnded}
            />
          </div>

          {/* Controls */}
          <ControlBar
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            isWhiteboardOpen={isWhiteboardOpen}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleWhiteboard={() => setIsWhiteboardOpen((v) => !v)}
            onEndCall={endCall}
          />

          {/* Teacher info */}
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{teacherName}</p>
            <p className="text-slate-400 text-xs">Swahili Lesson</p>
          </div>
        </div>
      </div>
    </div>
  );
}
