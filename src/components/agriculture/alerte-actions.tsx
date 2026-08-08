"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

export function AlerteActions({ alerteId }: { alerteId: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const acquit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agriculture/alertes/${alerteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Alerte acquittée par l'administrateur." }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
        <Check size={14} /> Acquittée
      </span>
    );
  }

  return (
    <button
      onClick={acquit}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-marine hover:bg-marine/5 hover:text-marine disabled:opacity-50"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      Acquitter
    </button>
  );
}
