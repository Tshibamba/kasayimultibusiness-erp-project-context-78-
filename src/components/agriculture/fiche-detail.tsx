"use client";

import { useState } from "react";
import Link from "next/link";
import {
  History,
  BellRing,
  SlidersHorizontal,
  LineChart as LineChartIcon,
  ArrowLeft,
} from "lucide-react";
import {
  Card,
  StatutStockBadge,
  TypeMouvementBadge,
  NiveauAlerteBadge,
  CategorieChip,
  EmptyState,
} from "@/components/agriculture/ui";
import { StockEvolutionChart } from "@/components/agriculture/stock-evolution-chart";
import { SeuilsForm } from "@/components/agriculture/seuils-form";
import { MouvementDialog } from "@/components/agriculture/mouvement-dialog";
import { AlerteActions } from "@/components/agriculture/alerte-actions";
import {
  formatMontant,
  formatNombre,
  formatDate,
  formatDateTime,
  toNum,
} from "@/lib/format";
import type { StatutStock, NiveauAlerte, TypeMouvement } from "@/db/schema";

type Mouvement = {
  id: number;
  type: TypeMouvement;
  quantite: number;
  prixAchat: number | null;
  motif: string | null;
  reference: string | null;
  fournisseurNom: string | null;
  quantiteAvant: number;
  quantiteApres: number;
  cmupAvant: number;
  cmupApres: number;
  valeur: number;
  createdAt: string;
};

type Alerte = {
  id: number;
  niveau: NiveauAlerte;
  type: string;
  message: string;
  statut: string;
  quantite: number;
  seuil: number | null;
  createdAt: string;
  resolvedAt: string | null;
};

type Tab = "evolution" | "mouvements" | "alertes" | "config";

export function FicheDetail({
  produit,
  stock,
  seuilAlerte,
  seuilCritique,
  mouvements,
  alertes,
  evolution,
}: {
  produit: { id: number; nom: string; categorie: string; unite: string; description: string | null };
  stock: { quantite: number; cmup: number; valeurStock: number; statut: StatutStock } | null;
  seuilAlerte: number;
  seuilCritique: number;
  mouvements: Mouvement[];
  alertes: Alerte[];
  evolution: { date: string; quantite: number; label: string }[];
}) {
  const [tab, setTab] = useState<Tab>("evolution");
  const quantite = stock?.quantite ?? 0;
  const cmup = stock?.cmup ?? 0;
  const valeur = stock?.valeurStock ?? 0;
  const statut = stock?.statut ?? "RUPTURE";

  const tabs: { id: Tab; label: string; icon: typeof History }[] = [
    { id: "evolution", label: "Évolution", icon: LineChartIcon },
    { id: "mouvements", label: `Historique (${mouvements.length})`, icon: History },
    { id: "alertes", label: `Alertes (${alertes.filter((a) => a.statut === "ACTIVE").length})`, icon: BellRing },
    { id: "config", label: "Configuration", icon: SlidersHorizontal },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/agriculture/stocks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-marine"
      >
        <ArrowLeft size={15} /> Retour aux stocks
      </Link>

      {/* En-tête fiche */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-r from-marine to-[#1d5a82] px-6 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                  <CategorieChip categorie={produit.categorie} />
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold">{produit.nom}</h1>
              {produit.description && (
                <p className="mt-1 max-w-2xl text-sm text-ciel-clair">{produit.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-wide text-ciel-clair">Stock actuel</p>
                <p className="font-display text-xl font-bold">
                  {formatNombre(quantite)} <span className="text-sm font-normal">{produit.unite}</span>
                </p>
              </div>
              <div className="rounded-xl bg-white/15 px-3 py-2">
                <span className="inline-flex h-full items-center rounded-md bg-white/95 px-2.5 py-1">
                  <StatutStockBadge statut={statut} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 lg:grid-cols-4">
          <Kpi label="CMUP" value={formatMontant(cmup, "CDF")} />
          <Kpi label="Valeur du stock" value={formatMontant(valeur, "CDF")} />
          <Kpi label="Seuil d'alerte" value={`${formatNombre(seuilAlerte)} ${produit.unite}`} />
          <Kpi label="Seuil critique" value={`${formatNombre(seuilCritique)} ${produit.unite}`} />
        </div>
      </Card>

      {/* Onglets */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-or text-marine"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
        <div className="ml-auto pb-2">
          <MouvementDialog
            produits={[{ id: produit.id, nom: produit.nom, unite: produit.unite }]}
            produitIdPreselect={produit.id}
          />
        </div>
      </div>

      {/* Contenu onglet */}
      {tab === "evolution" && (
        <Card className="p-6">
          <h3 className="font-display text-base font-bold text-slate-900">
            Évolution de la quantité en stock
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            Lignes pointillées = seuils d'alerte (or) et critique (rouge).
          </p>
          <StockEvolutionChart
            data={evolution}
            seuilAlerte={seuilAlerte}
            seuilCritique={seuilCritique}
            unite={produit.unite}
          />
        </Card>
      )}

      {tab === "mouvements" && (
        <Card className="overflow-hidden">
          {mouvements.length === 0 ? (
            <div className="p-6">
              <EmptyState emoji="📭" title="Aucun mouvement" description="Les entrées et sorties apparaîtront ici." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 text-right font-semibold">Quantité</th>
                    <th className="px-5 py-3 text-right font-semibold">Stock avant</th>
                    <th className="px-5 py-3 text-right font-semibold">Stock après</th>
                    <th className="px-5 py-3 text-right font-semibold">CMUP après</th>
                    <th className="px-5 py-3 font-semibold">Motif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {mouvements.map((m) => (
                    <tr key={m.id} className="transition hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                        {formatDate(m.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <TypeMouvementBadge type={m.type} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        {m.type === "ENTREE" ? "+" : m.type === "SORTIE" ? "−" : "±"}
                        {formatNombre(m.quantite)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500">{formatNombre(m.quantiteAvant)}</td>
                      <td className="px-5 py-3 text-right font-medium text-slate-700">
                        {formatNombre(m.quantiteApres)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">
                        {formatMontant(m.cmupApres, "CDF")}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        <span className="line-clamp-1">{m.motif || m.reference || "—"}</span>
                        {m.fournisseurNom && (
                          <span className="block text-xs text-slate-400">{m.fournisseurNom}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "alertes" && (
        <Card className="p-6">
          <h3 className="mb-4 font-display text-base font-bold text-slate-900">
            Alertes de ce produit
          </h3>
          {alertes.length === 0 ? (
            <EmptyState emoji="✅" title="Aucune alerte" description="Ce produit n'a jamais déclenché d'alerte." />
          ) : (
            <div className="space-y-3">
              {alertes.map((a) => (
                <div
                  key={a.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${
                    a.statut === "ACTIVE" ? "border-red-100 bg-red-50/40" : "border-slate-100 bg-slate-50/40"
                  }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-lg shadow-sm">
                    {a.statut === "ACTIVE" ? "🚨" : "✅"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <NiveauAlerteBadge niveau={a.niveau} />
                      <span className="text-xs font-medium text-slate-400">
                        {a.statut === "ACTIVE" ? "Active" : a.statut === "ACQUITTEE" ? "Acquittée" : "Résolue"} ·{" "}
                        {formatDateTime(a.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{a.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatNombre(a.quantite)} {produit.unite}
                    </p>
                    {a.seuil != null && <p className="text-xs text-slate-400">seuil {formatNombre(a.seuil)}</p>}
                  </div>
                  {a.statut === "ACTIVE" && <AlerteActions alerteId={a.id} />}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "config" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-slate-900">Seuils d'alerte</h3>
            <p className="mb-5 text-sm text-slate-500">
              Définissez les niveaux à partir desquels une alerte est déclenchée automatiquement.
            </p>
            <SeuilsForm
              produitId={produit.id}
              seuilAlerteInitial={seuilAlerte}
              seuilCritiqueInitial={seuilCritique}
            />
          </Card>
          <Card className="p-6">
            <h3 className="font-display text-base font-bold text-slate-900">Informations produit</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Nom" value={produit.nom} />
              <Row label="Catégorie" value={produit.categorie} />
              <Row label="Unité" value={produit.unite} />
              <Row label="Seuil d'alerte" value={`${formatNombre(seuilAlerte)} ${produit.unite}`} />
              <Row label="Seuil critique" value={`${formatNombre(seuilCritique)} ${produit.unite}`} />
              <Row label="Valeur unitaire (CMUP)" value={formatMontant(cmup, "CDF")} />
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
