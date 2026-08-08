"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/agriculture/ui";
import { ACTIVITES } from "@/lib/public/site-data";

export function ServiceRequestForm({ defaultTelephone }: { defaultTelephone?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ activite: "", telephone: defaultTelephone ?? "", description: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.description.trim()) {
      setError("Décrivez votre demande.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/client/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Échec");
      setDone(true);
      setForm({ activite: "", telephone: defaultTelephone ?? "", description: "" });
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="font-semibold text-emerald-800">Demande envoyée avec succès !</p>
        <p className="mt-1 text-sm text-emerald-700">Notre équipe vous contactera rapidement. Vous pouvez suivre cette demande ci-dessous.</p>
        <Button variant="outline" className="mt-3" onClick={() => setDone(false)}>Nouvelle demande</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Activité concernée">
          <Select value={form.activite} onChange={set("activite")}>
            <option value="">— Sélectionner —</option>
            {ACTIVITES.map((a) => (
              <option key={a.slug} value={a.nom}>{a.emoji} {a.nom}</option>
            ))}
          </Select>
        </Field>
        <Field label="Téléphone de contact">
          <Input value={form.telephone} onChange={set("telephone")} placeholder="+243 ..." />
        </Field>
      </div>
      <Field label="Votre demande" required>
        <Textarea rows={4} value={form.description} onChange={set("description")} placeholder="Décrivez votre besoin : devis, prestation, livraison..." />
      </Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Envoyer ma demande
      </Button>
    </form>
  );
}
