import Link from "next/link";
import { Sprout, MapPin, TrendingUp, Wheat } from "lucide-react";
import { db } from "@/db";
import { parcelle } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getProductionSynthese } from "@/lib/agriculture/production";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const [parcelles, synthese] = await Promise.all([
    db.select().from(parcelle).orderBy(asc(parcelle.nom)),
    getProductionSynthese(),
  ]);

  const margeTotale = synthese.reduce((s, c) => s + c.marge, 0);
  const revenuTotal = synthese.reduce((s, c) => s + c.revenu, 0);
  const recolteTotale = synthese.reduce((s, c) => s + c.quantiteRecoltee, 0);

  const kpis = [
    { label: "Cultures suivies", value: formatNombre(synthese.length, 0), icon: Sprout, tint: "bg-marine/10 text-marine" },
    { label: "Marge globale", value: formatMontant(margeTotale, "CDF"), icon: TrendingUp, tint: margeTotale >= 0 ? "bg-succes/10 text-succes" : "bg-danger/10 text-danger" },
    { label: "Revenu (ventes)", value: formatMontant(revenuTotal, "CDF"), icon: TrendingUp, tint: "bg-ciel/10 text-ciel" },
    { label: "Quantité récoltée", value: formatNombre(recolteTotale, 0), icon: Wheat, tint: "bg-or/15 text-[#c08700]" },
  ];

  const parcelleOptions = parcelles.map((p) => ({ value: String(p.id), label: `${p.nom} (${formatNombre(Number(p.surface))} ${p.uniteSurface})` }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Agriculture</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Production agricole</h1>
        <p className="mt-1 text-sm text-slate-500">Parcelles, cultures, traitements, récoltes et rentabilité.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-slate-500">{k.label}</p><p className="mt-2 font-display text-xl font-bold text-slate-900">{k.value}</p></div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.tint}`}><Icon size={20} /></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Parcelles */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><MapPin size={15} className="mb-0.5 mr-1 inline text-marine" />Parcelles</h2>
          <GenericForm
            endpoint="/api/agriculture/parcelles"
            title="Nouvelle parcelle"
            triggerLabel="Nouvelle parcelle"
            fields={[
              { name: "nom", label: "Nom", required: true },
              { name: "localisation", label: "Localisation" },
              { name: "surface", label: "Surface", type: "number" },
              { name: "uniteSurface", label: "Unité", placeholder: "ha, are..." },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-50 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
          {parcelles.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">Aucune parcelle.</p>
          ) : (
            parcelles.map((p) => (
              <div key={p.id} className="px-5 py-3.5">
                <p className="font-semibold text-slate-900">{p.nom}</p>
                <p className="text-xs text-slate-400">{p.localisation ?? "—"} · {formatNombre(Number(p.surface))} {p.uniteSurface}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Cultures */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><Sprout size={15} className="mb-0.5 mr-1 inline text-marine" />Cultures & rentabilité</h2>
          <GenericForm
            endpoint="/api/agriculture/cultures"
            title="Nouvelle culture"
            triggerLabel="Nouvelle culture"
            fields={[
              { name: "parcelleId", label: "Parcelle", type: "select", required: true, options: parcelleOptions },
              { name: "nom", label: "Culture", required: true, placeholder: "ex. Maïs — Saison 2026" },
              { name: "variete", label: "Variété" },
              { name: "superficie", label: "Superficie", type: "number" },
              { name: "mainOeuvre", label: "Main d'œuvre (CDF)", type: "number" },
              { name: "dateSemis", label: "Date semis", type: "date" },
              { name: "dateRecoltePrevue", label: "Récolte prévue", type: "date" },
              { name: "responsable", label: "Responsable" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Culture</th>
                <th className="px-5 py-2.5 font-semibold">Parcelle</th>
                <th className="px-5 py-2.5 text-right font-semibold">Coûts</th>
                <th className="px-5 py-2.5 text-right font-semibold">Revenu</th>
                <th className="px-5 py-2.5 text-right font-semibold">Marge</th>
                <th className="px-5 py-2.5 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {synthese.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Aucune culture.</td></tr>
              ) : synthese.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/agriculture/production/${c.id}`} className="font-semibold text-slate-900 hover:text-marine">{c.nom}</Link>
                    <p className="text-xs text-slate-400">Récolté : {formatNombre(c.quantiteRecoltee, 0)}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{c.parcelleNom}</td>
                  <td className="px-5 py-3.5 text-right text-danger">{formatMontant(c.coutTotal, "CDF")}</td>
                  <td className="px-5 py-3.5 text-right text-succes">{formatMontant(c.revenu, "CDF")}</td>
                  <td className={`px-5 py-3.5 text-right font-bold ${c.marge >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(c.marge, "CDF")}</td>
                  <td className="px-5 py-3.5"><span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium">{c.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-right">
        <Link href="/agriculture/analyse" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ciel hover:text-marine">
          <TrendingUp size={15} /> Voir l'analyse de rentabilité
        </Link>
      </div>
    </div>
  );
}
