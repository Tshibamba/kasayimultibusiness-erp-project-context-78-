"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/agriculture/ui";
import { ACTIVITES } from "@/lib/public/site-data";

export function ContactForm() {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", activite: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(null);
    if (!form.nom || !form.email || !form.message) {
      setError("Merci de renseigner votre nom, email et message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sujet: `Demande — ${form.activite || "Information"}` }),
      });
      if (!res.ok) throw new Error("Échec de l'envoi");
      setDone(true);
      setForm({ nom: "", email: "", telephone: "", activite: "", message: "" });
    } catch {
      setError("Une erreur est survenue. Réessayez svp.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
        <h3 className="mt-3 font-display text-lg font-bold text-emerald-800">Message envoyé !</h3>
        <p className="mt-1 text-sm text-emerald-700">Merci de nous avoir contactés. Notre équipe vous répondra rapidement.</p>
        <Button variant="outline" className="mt-4" onClick={() => setDone(false)}>Envoyer un autre message</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom complet" required>
          <Input value={form.nom} onChange={set("nom")} placeholder="Votre nom" />
        </Field>
        <Field label="Email" required>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="vous@email.com" />
        </Field>
        <Field label="Téléphone">
          <Input value={form.telephone} onChange={set("telephone")} placeholder="+243 ..." />
        </Field>
        <Field label="Activité concernée">
          <Select value={form.activite} onChange={set("activite")}>
            <option value="">— Sélectionner —</option>
            {ACTIVITES.map((a) => (
              <option key={a.slug} value={a.nom}>{a.emoji} {a.nom}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Votre message" required>
        <Textarea rows={5} value={form.message} onChange={set("message")} placeholder="Décrivez votre demande..." />
      </Field>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      <Button onClick={submit} disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Envoyer le message
      </Button>
    </div>
  );
}
