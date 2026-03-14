"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Video, VideoOff, User } from "lucide-react";

interface VideoPanelProps {
  lessonId: string;
  localStream: MediaStream | null;
  isCameraOn: boolean;
}

export default function VideoPanel({ lessonId, localStream, isCameraOn }: VideoPanelProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="flex-1 flex gap-2 p-2 bg-slate-900 rounded-xl overflow-hidden">
      {/* Remote video (placeholder) */}
      <div className="flex-1 relative bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        {!remoteConnected ? (
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <User className="h-10 w-10 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">Waiting for teacher to join...</p>
            <p className="text-slate-500 text-xs mt-1">Video call will start automatically</p>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Remote video stream</p>
        )}

        {/* Remote label */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          Teacher
        </div>
      </div>

      {/* Local video (small) */}
      <div className="w-48 relative bg-slate-800 rounded-lg overflow-hidden shrink-0">
        {isCameraOn && localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <VideoOff className="h-8 w-8 text-slate-500" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
          You
        </div>
      </div>
    </div>
  );
}
