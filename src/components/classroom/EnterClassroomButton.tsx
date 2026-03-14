"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

interface EnterClassroomButtonProps {
  teacherId: string;
  teacherName: string;
  size?: "sm" | "md";
}

export default function EnterClassroomButton({
  teacherId,
  teacherName,
  size = "sm",
}: EnterClassroomButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/lessons/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_id: teacherId }),
      });

      const data = await res.json();

      if (res.status === 409 && data.lesson_id) {
        // Already has active lesson — redirect to it
        router.push(`/classroom/${data.lesson_id}`);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Could not start lesson");
        return;
      }

      router.push(`/classroom/${data.lesson.id}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all
          bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
          ${size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-2.5 text-sm"}
          min-h-[44px]`}
      >
        <Video className="h-4 w-4" />
        {loading ? "Starting..." : "Enter Classroom"}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
      )}
    </div>
  );
}
