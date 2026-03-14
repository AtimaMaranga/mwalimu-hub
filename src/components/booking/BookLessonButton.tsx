"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import BookLessonModal from "./BookLessonModal";

interface BookLessonButtonProps {
  teacherId: string;
  teacherName: string;
  hourlyRate?: number;
  size?: "sm" | "md";
}

export default function BookLessonButton({
  teacherId,
  teacherName,
  hourlyRate,
  size = "sm",
}: BookLessonButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`w-full inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all
          bg-teal-600 text-white hover:bg-teal-700
          ${size === "sm" ? "px-3 py-1.5 text-sm" : "px-5 py-2.5 text-sm"}
          min-h-[44px]`}
      >
        <CalendarPlus className="h-4 w-4" />
        Schedule Lesson
      </button>

      {modalOpen && (
        <BookLessonModal
          teacherId={teacherId}
          teacherName={teacherName}
          hourlyRate={hourlyRate}
          onClose={() => setModalOpen(false)}
          onSuccess={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
