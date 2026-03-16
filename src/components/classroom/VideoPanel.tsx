"use client";

import { useRef, useEffect } from "react";
import { VideoOff, User, Loader2 } from "lucide-react";
import type { DailyParticipant } from "@daily-co/daily-js";

interface VideoPanelProps {
  localParticipant: DailyParticipant | null;
  remoteParticipant: DailyParticipant | null;
  isCameraOn: boolean;
  isJoining: boolean;
  partnerName: string;
}

function ParticipantVideo({
  participant,
  muted,
  label,
}: {
  participant: DailyParticipant | null;
  muted?: boolean;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const videoTrack = participant?.tracks?.video;
    if (videoRef.current) {
      if (
        videoTrack?.state === "playable" &&
        videoTrack.persistentTrack
      ) {
        videoRef.current.srcObject = new MediaStream([
          videoTrack.persistentTrack,
        ]);
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [
    participant?.tracks?.video?.state,
    participant?.tracks?.video?.persistentTrack,
  ]);

  useEffect(() => {
    const audioTrack = participant?.tracks?.audio;
    if (audioRef.current && !muted) {
      if (
        audioTrack?.state === "playable" &&
        audioTrack.persistentTrack
      ) {
        audioRef.current.srcObject = new MediaStream([
          audioTrack.persistentTrack,
        ]);
      } else {
        audioRef.current.srcObject = null;
      }
    }
  }, [
    participant?.tracks?.audio?.state,
    participant?.tracks?.audio?.persistentTrack,
    muted,
  ]);

  const hasVideo =
    participant?.tracks?.video?.state === "playable" && participant.video;

  return (
    <div className="relative w-full h-full bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2">
            <User className="h-10 w-10 text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">{label}</p>
        </div>
      )}

      {/* Play remote audio */}
      {!muted && <audio ref={audioRef} autoPlay playsInline />}

      {/* Name label */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
        {participant?.user_name || label}
      </div>
    </div>
  );
}

export default function VideoPanel({
  localParticipant,
  remoteParticipant,
  isCameraOn,
  isJoining,
  partnerName,
}: VideoPanelProps) {
  if (isJoining) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 rounded-xl">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 text-sm">Joining video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-2 p-2 bg-slate-900 rounded-xl overflow-hidden">
      {/* Remote video (large) */}
      <div className="flex-1">
        {remoteParticipant ? (
          <ParticipantVideo
            participant={remoteParticipant}
            label={partnerName}
          />
        ) : (
          <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm">
                Waiting for {partnerName} to join...
              </p>
              <p className="text-slate-500 text-xs mt-1">
                They&apos;ll appear here automatically
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local video (small) */}
      <div className="w-48 shrink-0">
        <ParticipantVideo
          participant={localParticipant}
          muted
          label="You"
        />
      </div>
    </div>
  );
}
