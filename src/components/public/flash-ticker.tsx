"use client";

import { Megaphone } from "lucide-react";

export function FlashTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="bg-marine text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 lg:px-8">
        <span className="flex shrink-0 items-center gap-1.5 bg-or px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white">
          <Megaphone size={13} /> Flash info
        </span>
        <div className="marquee-track relative flex-1 overflow-hidden py-2.5">
          <div className="animate-marquee flex w-max gap-12 whitespace-nowrap pr-12 text-sm">
            {doubled.map((t, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-slate-100">
                <span className="text-or">◆</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
