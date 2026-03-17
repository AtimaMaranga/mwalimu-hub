"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PenTool,
  PhoneOff,
  MessageSquare,
  LayoutGrid,
  Monitor,
  Paperclip,
} from "lucide-react";
import type { ViewMode } from "./VideoPanel";

interface ControlBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isWhiteboardOpen: boolean;
  isChatOpen: boolean;
  viewMode: ViewMode;
  unreadCount: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleWhiteboard: () => void;
  onToggleChat: () => void;
  onToggleView: () => void;
  onOpenFiles: () => void;
  onEndCall: () => void;
}

export default function ControlBar({
  isMicOn,
  isCameraOn,
  isWhiteboardOpen,
  isChatOpen,
  viewMode,
  unreadCount,
  onToggleMic,
  onToggleCamera,
  onToggleWhiteboard,
  onToggleChat,
  onToggleView,
  onOpenFiles,
  onEndCall,
}: ControlBarProps) {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-hide after 4 seconds of no mouse activity
  useEffect(() => {
    const resetTimer = () => {
      setVisible(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(false), 4000);
    };

    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("mousedown", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onMouseEnter={() => {
        setVisible(true);
        clearTimeout(timeoutRef.current);
      }}
    >
      <div className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Mic */}
          <ControlButton
            active={isMicOn}
            activeColor="bg-slate-700"
            inactiveColor="bg-red-500"
            onClick={onToggleMic}
            icon={isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            label={isMicOn ? "Mute" : "Unmute"}
          />

          {/* Camera */}
          <ControlButton
            active={isCameraOn}
            activeColor="bg-slate-700"
            inactiveColor="bg-red-500"
            onClick={onToggleCamera}
            icon={isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            label={isCameraOn ? "Stop Video" : "Start Video"}
          />

          {/* View toggle */}
          <ControlButton
            active={viewMode === "speaker"}
            activeColor="bg-indigo-600"
            inactiveColor="bg-slate-700"
            onClick={onToggleView}
            icon={viewMode === "gallery" ? <Monitor className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            label={viewMode === "gallery" ? "Speaker" : "Gallery"}
          />

          {/* Whiteboard */}
          <ControlButton
            active={isWhiteboardOpen}
            activeColor="bg-indigo-600"
            inactiveColor="bg-slate-700"
            onClick={onToggleWhiteboard}
            icon={<PenTool className="h-5 w-5" />}
            label="Whiteboard"
          />

          {/* Chat */}
          <div className="relative">
            <ControlButton
              active={isChatOpen}
              activeColor="bg-indigo-600"
              inactiveColor="bg-slate-700"
              onClick={onToggleChat}
              icon={<MessageSquare className="h-5 w-5" />}
              label="Chat"
            />
            {unreadCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          {/* Files */}
          <ControlButton
            active={false}
            activeColor="bg-slate-700"
            inactiveColor="bg-slate-700"
            onClick={onOpenFiles}
            icon={<Paperclip className="h-5 w-5" />}
            label="Files"
          />

          {/* Divider */}
          <div className="w-px h-10 bg-slate-600 mx-1 hidden sm:block" />

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="text-[10px] font-medium">End</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  activeColor,
  inactiveColor,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-white transition-colors hover:brightness-110 ${
        active ? activeColor : inactiveColor
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
