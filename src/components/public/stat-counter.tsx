"use client";

import { useEffect, useRef, useState } from "react";

export function StatCounter({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const dur = 1500;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.floor(p * value));
          if (p < 1) requestAnimationFrame(step);
          else setN(value);
        };
        requestAnimationFrame(step);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-3xl font-extrabold text-marine lg:text-4xl">
        {n.toLocaleString("fr-CD")}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
