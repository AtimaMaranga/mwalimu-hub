"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, PlayCircle } from "lucide-react";

interface StudentBookingActionsProps {
  bookingId: string;
  status: string;
  proposedDate: string;
}

export default function StudentBookingActions({
  bookingId,
  status,
  proposedDate,
}: StudentBookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const isToday = (() => {
    const proposed = new Date(proposedDate + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.abs(proposed.getTime() - today.getTime());
    return diff <= 86400000;
  })();

  const handleCancel = async () => {
    setLoading("cancel");
    setError("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to cancel");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading("");
    }
  };

  const handleJoin = async () => {
    setLoading("join");
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
        {status === "confirmed" && isToday && (
          <button
            onClick={handleJoin}
            disabled={!!loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <PlayCircle className="h-3 w-3" />
            {loading === "join" ? "Joining..." : "Join Lesson"}
          </button>
        )}
        {["pending", "confirmed"].includes(status) && (
          <button
            onClick={handleCancel}
            disabled={!!loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            <X className="h-3 w-3" />
            {loading === "cancel" ? "..." : "Cancel"}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
