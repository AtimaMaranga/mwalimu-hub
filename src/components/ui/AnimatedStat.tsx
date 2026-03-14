"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedStatProps {
  value: string; // e.g. "200M+", "5+", "98%", "14"
  label: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

/** Parse a stat value like "200M+" into { num: 200, suffix: "M+" } */
function parseValue(val: string): { num: number; suffix: string } {
  const match = val.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: val };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

export default function AnimatedStat({
  value,
  label,
  className = "text-center",
  valueClassName = "text-2xl font-bold text-white",
  labelClassName = "text-xs text-indigo-200 mt-0.5",
}: AnimatedStatProps) {
  const { num, suffix } = parseValue(value);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const steps = 60;
          const increment = num / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, num);
            setCount(Math.round(current));
            if (current >= num) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num]);

  return (
    <div ref={ref} className={className}>
      <p className={valueClassName}>
        {count}
        {suffix}
      </p>
      <p className={labelClassName}>{label}</p>
    </div>
  );
}
