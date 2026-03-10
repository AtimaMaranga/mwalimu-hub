"use client";

import { useState, useTransition } from "react";

interface OnlineToggleProps {
  initialValue: boolean;
}

export default function OnlineToggle({ initialValue }: OnlineToggleProps) {
  const [isOnline, setIsOnline] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle() {
    const next = !isOnline;
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/teacher/online-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_online: next }),
      });
      if (res.ok) {
        setIsOnline(next);
      } else {
        setError("Failed to update status");
      }
    });
  }

  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-600"}`}
        />
        <span className="text-sm text-white font-medium">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
          isOnline ? "bg-emerald-500" : "bg-slate-700"
        } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        role="switch"
        aria-checked={isOnline}
        aria-label="Toggle online status"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isOnline ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
