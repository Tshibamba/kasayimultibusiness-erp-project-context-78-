"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";

export function Testimonials({
  items,
}: {
  items: { nom: string; role: string; texte: string }[];
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 4800);
    return () => clearInterval(t);
  }, [items.length]);

  const t = items[i];

  return (
    <div className="mx-auto max-w-3xl text-center">
      <Quote size={40} className="mx-auto text-or/40" />
      <div className="flex justify-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star key={idx} size={18} className="fill-or text-or" />
        ))}
      </div>
      <p className="mt-4 font-display text-xl font-medium leading-relaxed text-slate-800 lg:text-2xl">
        « {t.texte} »
      </p>
      <div className="mt-5">
        <p className="font-bold text-marine">{t.nom}</p>
        <p className="text-sm text-slate-500">{t.role}</p>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-marine" : "w-2 bg-slate-300"}`}
            aria-label={`Témoignage ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
