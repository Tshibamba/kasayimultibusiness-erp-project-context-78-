"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

const MOIS = [
  { v: "", l: "Toute l'année" }, { v: "1", l: "Janvier" }, { v: "2", l: "Février" }, { v: "3", l: "Mars" },
  { v: "4", l: "Avril" }, { v: "5", l: "Mai" }, { v: "6", l: "Juin" }, { v: "7", l: "Juillet" },
  { v: "8", l: "Août" }, { v: "9", l: "Septembre" }, { v: "10", l: "Octobre" }, { v: "11", l: "Novembre" }, { v: "12", l: "Décembre" },
];

export function BilanPeriodSelector({ annee, mois }: { annee: number; mois: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const currentYear = new Date().getFullYear();
  const annees = [currentYear - 1, currentYear, currentYear + 1];

  const go = (a: string, m: string) => {
    const sp = new URLSearchParams();
    sp.set("annee", a);
    if (m) sp.set("mois", m);
    router.push(`/bilan?${sp.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500"><Calendar size={15} /> Période :</span>
      <select
        value={String(annee)}
        onChange={(e) => go(e.target.value, mois)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-ciel"
      >
        {annees.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select
        value={mois}
        onChange={(e) => go(String(annee), e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-ciel"
      >
        {MOIS.map((m) => <option key={m.v || "all"} value={m.v}>{m.l}</option>)}
      </select>
    </div>
  );
}
