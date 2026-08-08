"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/agriculture/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/agriculture/ui";
import { CATEGORIES, UNITES } from "@/lib/ui/agriculture";

export function ProduitDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("SEMENCE");
  const [unite, setUnite] = useState("kg");
  const [seuilAlerte, setSeuilAlerte] = useState("");
  const [seuilCritique, setSeuilCritique] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    setError(null);
    if (!nom.trim()) {
      setError("Le nom du produit est obligatoire.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/agriculture/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          categorie,
          unite,
          description: description || null,
          seuilAlerte: Number(seuilAlerte) || 0,
          seuilCritique: Number(seuilCritique) || 0,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur lors de la création.");
      }
      setOpen(false);
      setNom("");
      setDescription("");
      setSeuilAlerte("");
      setSeuilCritique("");
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
        Nouveau produit
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvel intrant"
        description="Renseignez la fiche du produit et configurez ses seuils d'alerte."
        size="lg"
      >
        <div className="space-y-4">
          <Field label="Nom du produit" required>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex. Semence maïs hybride H614"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Catégorie">
              <Select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Unité de mesure">
              <Select value={unite} onChange={(e) => setUnite(e.target.value)}>
                {UNITES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Seuil d'alerte" hint="Niveau « stock faible »">
              <Input
                type="number"
                step="0.01"
                value={seuilAlerte}
                onChange={(e) => setSeuilAlerte(e.target.value)}
                placeholder="ex. 20"
              />
            </Field>
            <Field label="Seuil critique" hint="Niveau « commander sans délai »">
              <Input
                type="number"
                step="0.01"
                value={seuilCritique}
                onChange={(e) => setSeuilCritique(e.target.value)}
                placeholder="ex. 8"
              />
            </Field>
          </div>

          <Field label="Description (optionnel)">
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Variété, dosage, conditions de stockage..."
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Créer le produit
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
