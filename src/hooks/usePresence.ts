"use client";

import { useEffect } from "react";

/**
 * Sends periodic presence heartbeats to /api/user/presence.
 * Pauses when the tab is hidden to save battery/bandwidth.
 */
export function usePresence(intervalMs = 30_000) {
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

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs]);
}
