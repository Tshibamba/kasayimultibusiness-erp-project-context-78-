"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from "lucide-react";
import { Modal } from "@/components/agriculture/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/agriculture/ui";
import { formatNombre } from "@/lib/format";
import type { TypeMouvement } from "@/db/schema";

type ProduitOption = { id: number; nom: string; unite: string };

export function MouvementDialog({
  produits,
  produitIdPreselect,
  fournisseurLabel = "Fournisseur",
}: {
  produits: ProduitOption[];
  produitIdPreselect?: number;
  fournisseurLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const locked = produits.length === 1 || produitIdPreselect != null;
  const [produitId, setProduitId] = useState<number | null>(
    produitIdPreselect ?? produits[0]?.id ?? null
  );
  const [type, setType] = useState<TypeMouvement>("ENTREE");
  const [quantite, setQuantite] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [fournisseurId, setFournisseurId] = useState("");
  const [motif, setMotif] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (produitIdPreselect != null) setProduitId(produitIdPreselect);
  }, [produitIdPreselect]);

  const produit = produits.find((p) => p.id === produitId);

  const reset = () => {
    setType("ENTREE");
    setQuantite("");
    setPrixAchat("");
    setFournisseurId("");
    setMotif("");
    setReference("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    const qte = Number(quantite);
    if (!produitId || !Number.isFinite(qte) || qte === 0) {
      setError("Veuillez saisir une quantité valide.");
      return;
    }
    if (type === "ENTREE" && (!prixAchat || Number(prixAchat) <= 0)) {
      setError("Le prix d'achat est requis pour une entrée.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/agriculture/mouvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produitId,
          type,
          quantite: type === "AJUSTEMENT" ? qte : Math.abs(qte),
          prixAchat: type === "ENTREE" ? Number(prixAchat) : null,
          motif: motif || null,
          reference: reference || null,
          fournisseurId: fournisseurId ? Number(fournisseurId) : null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erreur lors de l'enregistrement.");
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const types: { value: TypeMouvement; label: string; icon: typeof Plus; color: string }[] = [
    { value: "ENTREE", label: "Entrée", icon: ArrowDownToLine, color: "text-emerald-600" },
    { value: "SORTIE", label: "Sortie", icon: ArrowUpFromLine, color: "text-danger" },
    { value: "AJUSTEMENT", label: "Ajustement", icon: SlidersHorizontal, color: "text-ciel" },
  ];

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Nouveau mouvement
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Enregistrer un mouvement de stock"
        description="Le CMUP et les alertes sont recalculés automatiquement."
        size="lg"
      >
        <div className="space-y-4">
          {/* Type de mouvement */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Type de mouvement
            </span>
            <div className="grid grid-cols-3 gap-2">
              {types.map((t) => {
                const Icon = t.icon;
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "border-marine bg-marine/5 text-marine"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={16} className={active ? t.color : ""} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            {type === "AJUSTEMENT" && (
              <p className="mt-1.5 text-xs text-slate-400">
                Saisissez l'écart signé (ex. <code>-3</code> pour un manquant, <code>+2</code> pour un excédent d'inventaire).
              </p>
            )}
          </div>

          {!locked && (
            <Field label="Produit" required>
              <Select
                value={produitId ?? ""}
                onChange={(e) => setProduitId(Number(e.target.value))}
              >
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} ({p.unite})
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field
              label={type === "AJUSTEMENT" ? "Écart (signé)" : "Quantité"}
              required
              hint={produit ? `Unité : ${produit.unite}` : undefined}
            >
              <Input
                type="number"
                step="0.01"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="0"
              />
            </Field>

            {type === "ENTREE" ? (
              <>
                <Field label={`Prix d'achat unitaire (CDF)`} required hint="Sert au calcul du CMUP">
                  <Input
                    type="number"
                    step="0.01"
                    value={prixAchat}
                    onChange={(e) => setPrixAchat(e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label={fournisseurLabel}>
                  <FournisseurSelect value={fournisseurId} onChange={setFournisseurId} />
                </Field>
                <Field label="Référence (bon de commande)">
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="BC-0001"
                  />
                </Field>
              </>
            ) : null}
          </div>

          {type === "ENTREE" && quantite && prixAchat && (
            <div className="rounded-xl bg-marine/5 px-4 py-3 text-sm text-marine">
              Valeur totale de l'entrée :{" "}
              <strong>{formatNombre(Number(quantite) * Number(prixAchat), 0)} FC</strong>
            </div>
          )}

          <Field label="Motif / Observation">
            <Textarea
              rows={2}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder={
                type === "SORTIE"
                  ? "ex. Semis parcelle Nord"
                  : type === "ENTREE"
                    ? "ex. Réapprovisionnement campagne A"
                    : "ex. Inventaire physique du mois"
              }
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
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function FournisseurSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [options, setOptions] = useState<{ id: number; nom: string }[]>([]);
  useEffect(() => {
    fetch("/api/agriculture/fournisseurs")
      .then((r) => r.json())
      .then((d) => setOptions(d.items ?? []))
      .catch(() => {});
  }, []);
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Aucun —</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nom}
        </option>
      ))}
    </Select>
  );
}
