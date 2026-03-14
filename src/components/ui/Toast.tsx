"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error:   <XCircle className="h-5 w-5 text-red-500" />,
  info:    <AlertCircle className="h-5 w-5 text-teal-500" />,
};

const styles: Record<ToastType, string> = {
  success: "bg-emerald-50 border-emerald-200",
  error:   "bg-red-50 border-red-200",
  info:    "bg-teal-50 border-teal-200",
};

export default function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full",
        "transition-all duration-300",
        styles[type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{icons[type]}</span>
      <p className="text-sm text-slate-700 flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="shrink-0 text-slate-400 hover:text-slate-600"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Toast container (fixed bottom-right) */
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
    >
      {children}
    </div>
  );
}
