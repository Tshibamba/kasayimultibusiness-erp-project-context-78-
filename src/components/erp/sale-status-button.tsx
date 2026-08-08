"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUTS = ["PAYEE", "IMPAYEE", "PARTIELLEMENT"] as const;
const STYLES: Record<string, string> = {
  PAYEE: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  IMPAYEE: "bg-red-50 text-danger hover:bg-red-100",
  PARTIELLEMENT: "bg-amber-50 text-amber-700 hover:bg-amber-100",
};
const LABELS: Record<string, string> = {
  PAYEE: "Payée",
  IMPAYEE: "Impayée",
  PARTIELLEMENT: "Partielle",
};

export function SaleStatusButton({ saleId, statut }: { saleId: number; statut: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(statut);

  const cycle = async () => {
    const idx = STATUTS.indexOf(current as typeof STATUTS[number]);
    const next = STATUTS[(idx + 1) % STATUTS.length];
    setLoading(true);
    try {
      const res = await fetch(`/api/commerce/sales/${saleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: next }),
      });
      if (res.ok) {
        setCurrent(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={cycle}
      disabled={loading}
      title="Cliquer pour changer le statut"
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${STYLES[current] ?? "bg-slate-100 text-slate-500"}`}
    >
      {loading && <Loader2 size={11} className="animate-spin" />}
      {LABELS[current] ?? current}
    </button>
  );
}
