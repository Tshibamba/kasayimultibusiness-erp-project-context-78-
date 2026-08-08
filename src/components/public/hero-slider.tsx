"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/lib/public/site-data";

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <section className="relative h-[88vh] min-h-[560px] overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
            idx === i ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-marine/95 via-marine/75 to-marine/25" />
          <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 lg:px-8">
            <div className="max-w-2xl text-white">
              <span className="inline-flex items-center rounded-full bg-or/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                {s.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {s.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-200">{s.text}</p>
              <Link
                href={s.href}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-or px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-95"
              >
                {s.cta} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Flèches */}
      <button
        onClick={() => go(i - 1)}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/40 lg:block"
        aria-label="Précédent"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => go(i + 1)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/40 lg:block"
        aria-label="Suivant"
      >
        <ChevronRight size={22} />
      </button>

      {/* Points */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => go(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-or" : "w-2 bg-white/60 hover:bg-white"}`}
            aria-label={`Aller au slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
