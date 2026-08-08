"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";
import { Button } from "@/components/agriculture/ui";

export function SeedButton({ alreadySeeded = false }: { alreadySeeded?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const seed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "/api/agriculture/seed" + (alreadySeeded ? "?reset=1" : ""),
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Échec du chargement");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="gold" onClick={seed} disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Database size={16} />
        )}
        {alreadySeeded ? "Réinitialiser les données" : "Charger les données de démo"}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
