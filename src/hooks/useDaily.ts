"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe, {
  type DailyCall,
  type DailyParticipant,
  type DailyEventObjectParticipant,
  type DailyEventObjectParticipantLeft,
} from "@daily-co/daily-js";

export interface UseDailyOptions {
  lessonId: string;
}

export interface DailyState {
  callObject: DailyCall | null;
  localParticipant: DailyParticipant | null;
  remoteParticipant: DailyParticipant | null;
  isJoining: boolean;
  isJoined: boolean;
  error: string | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  toggleCamera: () => void;
  toggleMic: () => void;
  leave: () => Promise<void>;
}

export function useDaily({ lessonId }: UseDailyOptions): DailyState {
  const callRef = useRef<DailyCall | null>(null);
  const [localParticipant, setLocalParticipant] = useState<DailyParticipant | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<DailyParticipant | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function join() {
      try {
        // Fetch token from our API
        const res = await fetch(`/api/lessons/${lessonId}/token`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to get video token");
        }
        const { token, roomUrl } = await res.json();

        if (cancelled) return;

        const call = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: true,
        });
        callRef.current = call;

        // Event handlers
        const updateParticipants = () => {
          const participants = call.participants();
          setLocalParticipant(participants.local || null);

          const remote = Object.values(participants).find(
            (p) => !p.local
          );
          setRemoteParticipant(remote || null);
        };

        call.on("joined-meeting", () => {
          if (cancelled) return;
          setIsJoining(false);
          setIsJoined(true);
          updateParticipants();
        });

        call.on("participant-joined", () => updateParticipants());
        call.on("participant-updated", () => updateParticipants());
        call.on("participant-left", () => updateParticipants());

        call.on("error", (ev) => {
          console.error("Daily error:", ev);
          setError("Video call error. Please refresh the page.");
        });

        call.on("left-meeting", () => {
          setIsJoined(false);
        });

        await call.join({ url: roomUrl, token });
      } catch (err: any) {
        if (!cancelled) {
          console.error("Daily join failed:", err);
          setError(err.message || "Failed to join video call");
          setIsJoining(false);
        }
      }
    }

    join();

    return () => {
      cancelled = true;
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
        callRef.current.destroy().catch(() => {});
        callRef.current = null;
      }
    };
  }, [lessonId]);

  const toggleCamera = useCallback(() => {
    const call = callRef.current;
    if (!call) return;
    const newState = !isCameraOn;
    call.setLocalVideo(newState);
    setIsCameraOn(newState);
  }, [isCameraOn]);

  const toggleMic = useCallback(() => {
    const call = callRef.current;
    if (!call) return;
    const newState = !isMicOn;
    call.setLocalAudio(newState);
    setIsMicOn(newState);
  }, [isMicOn]);

  const leave = useCallback(async () => {
    const call = callRef.current;
    if (call) {
      await call.leave();
      call.destroy();
      callRef.current = null;
    }
  }, []);

  return {
    callObject: callRef.current,
    localParticipant,
    remoteParticipant,
    isJoining,
    isJoined,
    error,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    leave,
  };
}
