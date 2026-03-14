"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, PlayCircle } from "lucide-react";

interface BookingActionsProps {
  bookingId: string;
  status: string;
  proposedDate: string;
}

export default function BookingActions({ bookingId, status, proposedDate }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const isToday = (() => {
    const proposed = new Date(proposedDate + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.abs(proposed.getTime() - today.getTime());
    return diff <= 86400000; // within 1 day
  })();

  const handleRespond = async (action: "confirm" | "decline") => {
    setLoading(action);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading("");
    }
  };

  const handleStartLesson = async () => {
    setLoading("start");
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/start-lesson`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.lesson_id) {
          router.push(`/classroom/${data.lesson_id}`);
          return;
        }
        setError(data.error || "Failed to start lesson");
        return;
      }
      router.push(`/classroom/${data.lesson.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading("");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => handleRespond("confirm")}
              disabled={!!loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-3 w-3" />
              {loading === "confirm" ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => handleRespond("decline")}
              disabled={!!loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              <X className="h-3 w-3" />
              {loading === "decline" ? "..." : "Decline"}
            </button>
          </>
        )}
        {status === "confirmed" && isToday && (
          <button
            onClick={handleStartLesson}
            disabled={!!loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <PlayCircle className="h-3 w-3" />
            {loading === "start" ? "Starting..." : "Start Lesson"}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
