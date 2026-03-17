"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { DailyCall, DailyParticipant } from "@daily-co/daily-js";

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
  activeSpeaker: string | null;
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
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function join() {
      try {
        // Step 1: Fetch token from our API
        const res = await fetch(`/api/lessons/${lessonId}/token`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
          throw new Error(data?.error || `Token request failed (${res.status})`);
        }

        const { token, roomUrl } = data;

        if (!token || !roomUrl) {
          throw new Error("Server returned empty token or room URL");
        }

        if (cancelled) return;

        // Step 2: Dynamically import Daily SDK (avoids SSR issues)
        const DailyIframe = (await import("@daily-co/daily-js")).default;

        if (cancelled) return;

        // Step 3: Create Daily call object
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

        // Active speaker detection
        call.on("active-speaker-change", (ev) => {
          if (ev?.activeSpeaker?.peerId) {
            setActiveSpeaker(ev.activeSpeaker.peerId);
          }
        });

        call.on("error", (ev) => {
          console.error("Daily call error event:", ev);
          setError("Video call error. Please refresh the page.");
        });

        call.on("left-meeting", () => {
          setIsJoined(false);
        });

        // Step 4: Join the room
        await call.join({ url: roomUrl, token });
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || "Failed to join video call";
          console.error("Daily join failed:", msg, err);
          setError(msg);
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
    activeSpeaker,
    toggleCamera,
    toggleMic,
    leave,
  };
}
