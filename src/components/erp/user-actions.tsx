"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, KeyRound } from "lucide-react";

export function UserActions({ userId, isActive }: { userId: number; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const patch = async (body: Record<string, unknown>) => {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    router.refresh();
    setLoading(false);
  };

  const toggle = () => patch({ isActive: !isActive });

  const reset = async () => {
    const np = window.prompt("Nouveau mot de passe (≥ 6 caractères) :");
    if (!np) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword: np }) });
    if (!res.ok) { const j = await res.json(); alert(j.error || "Échec"); }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={toggle} disabled={loading} title={isActive ? "Désactiver" : "Activer"} className={`grid h-8 w-8 place-items-center rounded-lg transition disabled:opacity-50 ${isActive ? "text-slate-400 hover:bg-red-50 hover:text-danger" : "text-emerald-600 hover:bg-emerald-50"}`}>
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
      </button>
      <button onClick={reset} disabled={loading} title="Réinitialiser le mot de passe" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-marine/10 hover:text-marine disabled:opacity-50">
        <KeyRound size={14} />
      </button>
    </div>
  );
}
