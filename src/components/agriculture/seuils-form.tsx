"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Button, Field, Input } from "@/components/agriculture/ui";

export function SeuilsForm({
  produitId,
  seuilAlerteInitial,
  seuilCritiqueInitial,
}: {
  produitId: number;
  seuilAlerteInitial: number;
  seuilCritiqueInitial: number;
}) {
  const [alerte, setAlerte] = useState(String(seuilAlerteInitial));
  const [critique, setCritique] = useState(String(seuilCritiqueInitial));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    setError(null);
    setMsg(null);
    const a = Number(alerte);
    const c = Number(critique);
    if (Number.isNaN(a) || Number.isNaN(c)) {
      setError("Veuillez saisir des valeurs numériques.");
      return;
    }
    if (c > a) {
      setError("Le seuil critique doit être inférieur ou égal au seuil d'alerte.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/agriculture/stocks/${produitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seuilAlerte: a, seuilCritique: c }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur");
      }
      setMsg("Seuils mis à jour. Le statut et les alertes ont été recalculés.");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Seuil d'alerte">
          <Input
            type="number"
            step="0.01"
            value={alerte}
            onChange={(e) => setAlerte(e.target.value)}
          />
        </Field>
        <Field label="Seuil critique">
          <Input
            type="number"
            step="0.01"
            value={critique}
            onChange={(e) => setCritique(e.target.value)}
          />
        </Field>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
      )}
      {msg && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {msg}
        </p>
      )}
      <Button onClick={submit} disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Enregistrer les seuils
      </Button>
    </div>
  );
}
