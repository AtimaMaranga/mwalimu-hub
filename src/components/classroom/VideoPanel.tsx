"use client";

import { useRef, useEffect } from "react";
import { VideoOff, User, Loader2 } from "lucide-react";
import type { DailyParticipant } from "@daily-co/daily-js";

export type ViewMode = "gallery" | "speaker";

interface VideoPanelProps {
  localParticipant: DailyParticipant | null;
  remoteParticipant: DailyParticipant | null;
  isCameraOn: boolean;
  isJoining: boolean;
  partnerName: string;
  viewMode: ViewMode;
  activeSpeaker: string | null;
}

function ParticipantVideo({
  participant,
  muted,
  label,
  isActiveSpeaker,
  className,
}: {
  participant: DailyParticipant | null;
  muted?: boolean;
  label: string;
  isActiveSpeaker?: boolean;
  className?: string;
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
    <div
      className={`relative bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center ${
        isActiveSpeaker ? "ring-2 ring-indigo-500" : ""
      } ${className || "w-full h-full"}`}
    >
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

      {!muted && <audio ref={audioRef} autoPlay playsInline />}

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1.5">
        {isActiveSpeaker && (
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        )}
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
  viewMode,
  activeSpeaker,
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

  const localIsActive = activeSpeaker === localParticipant?.session_id;
  const remoteIsActive = activeSpeaker === remoteParticipant?.session_id;

  // Speaker view: large + PIP
  if (viewMode === "speaker") {
    const speakerIsRemote = !localIsActive || remoteIsActive;
    const mainParticipant = speakerIsRemote ? remoteParticipant : localParticipant;
    const pipParticipant = speakerIsRemote ? localParticipant : remoteParticipant;
    const mainLabel = speakerIsRemote ? partnerName : "You";
    const pipLabel = speakerIsRemote ? "You" : partnerName;
    const mainMuted = !speakerIsRemote ? true : false;
    const pipMuted = speakerIsRemote ? true : false;

    return (
      <div className="flex-1 relative bg-slate-900 rounded-xl overflow-hidden">
        {/* Main speaker */}
        {mainParticipant ? (
          <ParticipantVideo
            participant={mainParticipant}
            muted={mainMuted}
            label={mainLabel}
            isActiveSpeaker={speakerIsRemote ? remoteIsActive : localIsActive}
          />
        ) : (
          <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <User className="h-12 w-12 text-slate-500" />
              </div>
              <p className="text-slate-400">Waiting for {partnerName}...</p>
            </div>
          </div>
        )}

        {/* PIP */}
        <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl overflow-hidden shadow-2xl border border-slate-600">
          <ParticipantVideo
            participant={pipParticipant}
            muted={pipMuted}
            label={pipLabel}
            isActiveSpeaker={speakerIsRemote ? localIsActive : remoteIsActive}
          />
        </div>
      </div>
    );
  }

  // Gallery view: 50/50 split
  return (
    <div className="flex-1 flex gap-2 bg-slate-900 rounded-xl overflow-hidden p-2">
      {/* Remote */}
      <div className="flex-1">
        {remoteParticipant ? (
          <ParticipantVideo
            participant={remoteParticipant}
            label={partnerName}
            isActiveSpeaker={remoteIsActive}
          />
        ) : (
          <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm">
                Waiting for {partnerName} to join...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local */}
      <div className="flex-1">
        <ParticipantVideo
          participant={localParticipant}
          muted
          label="You"
          isActiveSpeaker={localIsActive}
        />
      </div>
    </div>
  );
}
