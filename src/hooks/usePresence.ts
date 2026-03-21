"use client";

import { useEffect } from "react";

/**
 * Sends periodic presence heartbeats to /api/user/presence.
 * Pauses when the tab is hidden to save battery/bandwidth.
 * For teachers, sets is_online = false on page unload via sendBeacon.
 */
export function usePresence(intervalMs = 30_000, isTeacher = false) {
  useEffect(() => {
    const ping = () => fetch("/api/user/presence", { method: "PATCH" }).catch(() => {});
    ping();

    let interval = setInterval(ping, intervalMs);

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        ping();
        interval = setInterval(ping, intervalMs);
      }
    };

    // For teachers: set offline on page unload
    const handleBeforeUnload = () => {
      if (isTeacher) {
        navigator.sendBeacon(
          "/api/teacher/online-status",
          new Blob([JSON.stringify({ is_online: false })], { type: "application/json" })
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [intervalMs, isTeacher]);
}
