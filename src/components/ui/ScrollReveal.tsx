"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before the reveal transition starts */
  delay?: number;
  /** Intersection threshold — 0 to 1 */
  threshold?: number;
}

/**
 * Wraps children in a div that fades + slides up when scrolled into view.
 * Hidden state is applied via JS only (after mount), so SSR renders content
 * fully visible — no blank sections on slow connections or hydration delay.
 */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.08,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Apply hidden state via inline style (JS-only — SSR renders visible)
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

    const reveal = () => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -20px 0px" }
    );

    // Use rAF so the opacity:0 style is painted before we start observing,
    // preventing a flash of visible → invisible for already-in-view elements.
    const raf = requestAnimationFrame(() => observer.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [delay, threshold]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
