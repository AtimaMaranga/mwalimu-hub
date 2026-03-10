"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Detects Supabase auth tokens in the URL hash (implicit flow fallback)
 * and redirects to the appropriate page.
 * Handles: type=recovery → /auth/reset-password
 */
export default function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace("#", ""));
    const type = params.get("type");
    const accessToken = params.get("access_token");

    if (type === "recovery" && accessToken) {
      router.replace("/auth/reset-password");
    }
  }, [router]);

  return null;
}
