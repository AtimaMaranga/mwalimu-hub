"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LessonTimerProps {
  startedAt: string;
}

export default function LessonTimer({ startedAt }: LessonTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Clock className="h-4 w-4 text-slate-400" />
      <span className="font-mono font-bold text-slate-700">{formatted}</span>
    </div>
  );
}
