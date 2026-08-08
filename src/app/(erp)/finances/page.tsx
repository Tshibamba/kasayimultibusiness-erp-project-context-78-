import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, Landmark, ArrowRight, FileText } from "lucide-react";
import { db } from "@/db";
import { depense, recette, taxPayment } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getBilanGlobal } from "@/lib/bilan";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTIVITES = [
  { value: "agriculture", label: "🌱 Agriculture" },
  { value: "commerce", label: "🛒 Commerce" },
  { value: "transport", label: "🚚 Transport" },
  { value: "sous-traitance", label: "🏗️ Sous-traitance" },
  { value: "traiteur", label: "🍽️ Service traiteur" },
  { value: "general", label: "📋 Général / Transversal" },
];

export default async function FinancesPage() {
  const year = new Date().getFullYear();
  const [bilan, depenses, recettes, taxes] = await Promise.all([
    getBilanGlobal(year),
    db.select().from(depense).orderBy(desc(depense.date)).limit(15),
    db.select().from(recette).orderBy(desc(recette.date)).limit(15),
    db.select().from(taxPayment),
  ]);

  const centralDepenses = depenses.reduce((s, d) => s + toNum(d.montant), 0);
  const centralRecettes = recettes.reduce((s, r) => s + toNum(r.montant), 0);
  const impotsPayes = taxes.filter((t) => t.statut === "paye").reduce((s, t) => s + toNum(t.montant), 0);

  const recettesTotal = bilan.totalRecettes + centralRecettes;
  const depensesTotal = bilan.totalDepenses + centralDepenses;
  const beneficeNet = recettesTotal - depensesTotal;

  const kpis = [
    { label: `Recettes totales ${year}`, value: formatMontant(recettesTotal, "CDF"), icon: TrendingUp, tint: "bg-emerald-50 text-emerald-700" },
    { label: `Dépenses totales ${year}`, value: formatMontant(depensesTotal, "CDF"), icon: TrendingDown, tint: "bg-red-50 text-danger" },
    { label: "Bénéfice net", value: formatMontant(beneficeNet, "CDF"), icon: Wallet, tint: beneficeNet >= 0 ? "bg-marine/10 text-marine" : "bg-red-50 text-danger" },
    { label: "Impôts payés", value: formatMontant(impotsPayes, "CDF"), icon: Landmark, tint: "bg-or/15 text-[#c08700]" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Module charnière</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Gestion financière transversale</h1>
        <p className="mt-1 text-sm text-slate-500">Centralisation des dépenses (BF18), recettes (BF19) et impôts (BF20) de toutes les activités — {year}.</p>
      </div>

      {/* KPIs globaux */}
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

      {/* Dépenses + Recettes centralisées */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* BF18 : Dépenses */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><TrendingDown size={15} className="mb-0.5 mr-1 inline text-danger" />Dépenses transversales (BF18)</h2>
            <GenericForm endpoint="/api/finances/depenses" title="Nouvelle dépense" description="Enregistrez une dépense pour n'importe quelle activité." triggerLabel="Dépense" triggerVariant="outline" fields={[
              { name: "nature", label: "Nature", required: true, placeholder: "ex. Location matériel, électricité..." },
              { name: "montant", label: "Montant (CDF)", type: "number", required: true },
              { name: "activite", label: "Activité concernée", type: "select", options: ACTIVITES },
              { name: "categorie", label: "Catégorie (RG03)", type: "select", options: [
                { value: "Achat marchandises", label: "Achat marchandises" }, { value: "Carburant", label: "Carburant" },
                { value: "Salaire", label: "Salaire" }, { value: "Entretien", label: "Entretien" },
                { value: "Transport", label: "Transport" }, { value: "Matériel", label: "Matériel" },
                { value: "Impôt", label: "Impôt" }, { value: "Autres charges", label: "Autres charges" },
              ] },
              { name: "responsable", label: "Responsable", placeholder: "Nom de l'agent" },
              { name: "modePaiement", label: "Mode de paiement", type: "select", options: [
                { value: "Espèces", label: "Espèces" }, { value: "Virement", label: "Virement" },
                { value: "Chèque", label: "Chèque" }, { value: "Mobile money", label: "Mobile money" }, { value: "Crédit", label: "Crédit" },
              ] },
              { name: "date", label: "Date", type: "date" },
              { name: "justificatif", label: "Justificatif (réf.)", placeholder: "N° facture, reçu..." },
              { name: "notes", label: "Notes", type: "textarea" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {depenses.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune dépense enregistrée.</p> : depenses.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.nature}</p>
                  <p className="text-xs text-slate-400">{ACTIVITES.find((a) => a.value === d.activite)?.label ?? d.activite} · {formatDate(d.date)}{d.justificatif ? " · " + d.justificatif : ""}</p>
                </div>
                <p className="font-display text-sm font-bold text-danger">{formatMontant(toNum(d.montant), "CDF")}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* BF19 : Recettes */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><TrendingUp size={15} className="mb-0.5 mr-1 inline text-emerald-600" />Recettes transversales (BF19)</h2>
            <GenericForm endpoint="/api/finances/recettes" title="Nouvelle recette" description="Enregistrez un revenu non lié à un module spécifique." triggerLabel="Recette" triggerVariant="outline" fields={[
              { name: "source", label: "Source", required: true, placeholder: "ex. Prestation, don, subvention..." },
              { name: "description", label: "Description" },
              { name: "montant", label: "Montant (CDF)", type: "number", required: true },
              { name: "activite", label: "Activité", type: "select", options: ACTIVITES },
              { name: "date", label: "Date", type: "date" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {recettes.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune recette enregistrée.</p> : recettes.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.source}</p>
                  <p className="text-xs text-slate-400">{ACTIVITES.find((a) => a.value === r.activite)?.label ?? r.activite} · {formatDate(r.date)}{r.description ? " · " + r.description : ""}</p>
                </div>
                <p className="font-display text-sm font-bold text-emerald-600">{formatMontant(toNum(r.montant), "CDF")}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Synthèse par activité (depuis le bilan agrégé) */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900">Synthèse par activité — {year}</h2>
          <Link href="/bilan" className="inline-flex items-center gap-1 text-sm font-semibold text-ciel hover:text-marine">Bilan détaillé <ArrowRight size={14} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Activité</th>
              <th className="px-5 py-2.5 text-right font-semibold">Recettes</th>
              <th className="px-5 py-2.5 text-right font-semibold">Dépenses</th>
              <th className="px-5 py-2.5 text-right font-semibold">Bénéfice</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {bilan.services.map((s) => (
                <tr key={s.service} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-medium text-slate-700">{s.emoji} {s.service}</td>
                  <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(s.recettes, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMontant(s.depenses, "CDF")}</td>
                  <td className={`px-5 py-3 text-right font-bold ${s.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(s.benefice, "CDF")}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td className="px-5 py-3 text-slate-700">Total modules</td>
                <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(bilan.totalRecettes, "CDF")}</td>
                <td className="px-5 py-3 text-right text-danger">{formatMontant(bilan.totalDepenses, "CDF")}</td>
                <td className={`px-5 py-3 text-right ${bilan.beneficeNet >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(bilan.beneficeNet, "CDF")}</td>
              </tr>
              {centralDepenses > 0 || centralRecettes > 0 ? (
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                  <td className="px-5 py-3 text-slate-700">+ Transversal (central)</td>
                  <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(centralRecettes, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMontant(centralDepenses, "CDF")}</td>
                  <td className={`px-5 py-3 text-right ${centralRecettes - centralDepenses >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(centralRecettes - centralDepenses, "CDF")}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* BF20 : Impôts & taxes — lien */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/taxes">
          <Card className="group flex items-center gap-4 p-5 transition hover:shadow-md">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-or/15 text-[#c08700]"><Landmark size={22} /></div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-bold text-slate-900">Impôts & taxes (BF20)</h3>
              <p className="text-xs text-slate-400">{formatNombre(taxes.length, 0)} impôt(s) enregistré(s) · {formatMontant(impotsPayes, "CDF")} payés</p>
            </div>
            <ArrowRight size={18} className="text-slate-300 transition group-hover:text-marine" />
          </Card>
        </Link>
        <Link href="/bilan">
          <Card className="group flex items-center gap-4 p-5 transition hover:shadow-md">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-marine/10 text-marine"><FileText size={22} /></div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-bold text-slate-900">Bilan financier détaillé</h3>
              <p className="text-xs text-slate-400">Par mois et par année · exports PDF & Excel</p>
            </div>
            <ArrowRight size={18} className="text-slate-300 transition group-hover:text-marine" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
