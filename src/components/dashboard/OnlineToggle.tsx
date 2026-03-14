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
    <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_6px_#22c55e]" : "bg-slate-300"}`}
        />
        <span className={`text-sm font-medium ${isOnline ? "text-emerald-700" : "text-slate-500"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isOnline ? "bg-emerald-500" : "bg-slate-200"
        } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        role="switch"
        aria-checked={isOnline}
        aria-label="Toggle online status"
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            isOnline ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
