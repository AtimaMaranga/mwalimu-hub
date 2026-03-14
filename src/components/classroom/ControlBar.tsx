"use client";

import { Mic, MicOff, Video, VideoOff, PenTool, PhoneOff } from "lucide-react";

interface ControlBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isWhiteboardOpen: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleWhiteboard: () => void;
  onEndCall: () => void;
}

export default function ControlBar({
  isMicOn,
  isCameraOn,
  isWhiteboardOpen,
  onToggleMic,
  onToggleCamera,
  onToggleWhiteboard,
  onEndCall,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onToggleMic}
        className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
          isMicOn
            ? "bg-slate-700 text-white hover:bg-slate-600"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
        title={isMicOn ? "Mute" : "Unmute"}
      >
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </button>

      <button
        onClick={onToggleCamera}
        className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
          isCameraOn
            ? "bg-slate-700 text-white hover:bg-slate-600"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
        title={isCameraOn ? "Turn off camera" : "Turn on camera"}
      >
        {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </button>

      <button
        onClick={onToggleWhiteboard}
        className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
          isWhiteboardOpen
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-slate-700 text-white hover:bg-slate-600"
        }`}
        title={isWhiteboardOpen ? "Close whiteboard" : "Open whiteboard"}
      >
        <PenTool className="h-5 w-5" />
      </button>

      <button
        onClick={onEndCall}
        className="h-12 w-14 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-colors"
        title="End lesson"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
