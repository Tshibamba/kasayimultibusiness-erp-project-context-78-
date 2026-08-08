"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/agriculture/modal";
import { Button, Field, Input } from "@/components/agriculture/ui";

export function FournisseurDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
    contact: "",
    typeSemence: "",
    conditionsPaiement: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(null);
    if (!form.nom.trim()) {
      setError("Le nom du fournisseur est obligatoire.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/agriculture/fournisseurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur");
      }
      setOpen(false);
      setForm({ nom: "", telephone: "", email: "", adresse: "", contact: "", typeSemence: "", conditionsPaiement: "" });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="gold" onClick={() => setOpen(true)}>
        <Plus size={16} />
        Nouveau fournisseur
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau fournisseur"
        description="Renseignez les coordonnées et les informations d'achat (BF03)."
      >
        <div className="space-y-4">
          <Field label="Nom / Raison sociale" required>
            <Input value={form.nom} onChange={set("nom")} placeholder="ex. AgriDistribution SARL" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone">
              <Input value={form.telephone} onChange={set("telephone")} placeholder="+243 ..." />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={set("email")} placeholder="contact@..." />
            </Field>
          </div>
          <Field label="Adresse">
            <Input value={form.adresse} onChange={set("adresse")} placeholder="Ville, quartier..." />
          </Field>
          <Field label="Personne de contact">
            <Input value={form.contact} onChange={set("contact")} placeholder="Nom du responsable" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type de semence fournie">
              <Input value={form.typeSemence} onChange={set("typeSemence")} placeholder="ex. Maïs, Soja, Pomme de terre..." />
            </Field>
            <Field label="Conditions de paiement">
              <Input value={form.conditionsPaiement} onChange={set("conditionsPaiement")} placeholder="ex. Comptant, 30 jours..." />
            </Field>
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
