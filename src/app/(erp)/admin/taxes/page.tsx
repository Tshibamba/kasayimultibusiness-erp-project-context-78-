import { db } from "@/db";
import { taxPayment } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Landmark, Wallet, CalendarClock, TrendingUp } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getBilanGlobal } from "@/lib/bilan";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "TVA", label: "TVA (16%)" }, { value: "IPR", label: "IPR (salaires)" },
  { value: "CNSS", label: "CNSS" }, { value: "IBP", label: "IBP (bénéfices)" },
  { value: "Patente", label: "Patente" }, { value: "Taxe véhicules", label: "Taxe véhicules" }, { value: "Autre", label: "Autre" },
];

export default async function TaxesPage() {
  const [items, bilan] = await Promise.all([
    db.select().from(taxPayment).orderBy(asc(taxPayment.echeance)),
    getBilanGlobal(new Date().getFullYear()),
  ]);

  const totalPaye = items.filter((i) => i.statut === "paye").reduce((s, i) => s + toNum(i.montant), 0);
  const totalAPayer = items.filter((i) => i.statut !== "paye").reduce((s, i) => s + toNum(i.montant), 0);
  const today = new Date();
  const echeances = items.filter((i) => i.statut !== "paye" && i.echeance && new Date(i.echeance) >= today);

  const kpis = [
    { label: "Impôts payés", value: formatMontant(totalPaye, "CDF"), icon: Wallet, tint: "bg-emerald-50 text-emerald-700" },
    { label: "À payer", value: formatMontant(totalAPayer, "CDF"), icon: Landmark, tint: "bg-red-50 text-danger" },
    { label: "Échéances à venir", value: formatNombre(echeances.length, 0), icon: CalendarClock, tint: "bg-or/15 text-[#c08700]" },
    { label: "Bénéfice imposable (année)", value: formatMontant(bilan.beneficeNet, "CDF"), icon: TrendingUp, tint: "bg-marine/10 text-marine" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Administration</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Impôts &amp; taxes</h1>
          <p className="mt-1 text-sm text-slate-500">Enregistrement des impôts payés, suivi des échéances et base fiscale par activité.</p>
        </div>
        <GenericForm endpoint="/api/admin/taxes" title="Nouvel impôt / taxe" triggerLabel="Nouvel impôt" fields={[
          { name: "type", label: "Type", type: "select", required: true, options: TYPES },
          { name: "periode", label: "Période", placeholder: "ex. 2026-07 ou 2026" },
          { name: "montant", label: "Montant (CDF)", type: "number" },
          { name: "echeance", label: "Échéance", type: "date" },
          { name: "datePaiement", label: "Date de paiement", type: "date" },
          { name: "reference", label: "Référence / quittance" },
          { name: "statut", label: "Statut", type: "select", options: [{ value: "a_payer", label: "À payer" }, { value: "paye", label: "Payé" }] },
        ]} />
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

      {/* Échéances à venir */}
      {echeances.length > 0 && (
        <Card className="overflow-hidden border-amber-200">
          <div className="border-b border-amber-100 bg-amber-50/50 px-5 py-3 font-display text-sm font-bold text-amber-800"><CalendarClock size={15} className="mb-0.5 mr-1 inline" />Échéances à venir ({echeances.length})</div>
          <div className="divide-y divide-slate-50">
            {echeances.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div><p className="text-sm font-semibold text-slate-900">{e.type} — {e.periode ?? "—"}</p><p className="text-xs text-slate-400">Échéance : {formatDate(e.echeance)}</p></div>
                <p className="font-display text-sm font-bold text-danger">{formatMontant(toNum(e.montant), "CDF")}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Base fiscale par activité */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Base fiscale par activité — {new Date().getFullYear()}</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400"><th className="px-5 py-2.5 font-semibold">Activité</th><th className="px-5 py-2.5 text-right font-semibold">Recettes</th><th className="px-5 py-2.5 text-right font-semibold">Bénéfice</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {bilan.services.map((s) => (
                <tr key={s.service} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3"><span className="mr-2">{s.emoji}</span><span className="font-medium text-slate-700">{s.service}</span></td>
                  <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(s.recettes, "CDF")}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${s.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(s.benefice, "CDF")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Historique des impôts */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Historique des impôts &amp; taxes</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400"><th className="px-5 py-2.5 font-semibold">Type</th><th className="px-5 py-2.5 font-semibold">Période</th><th className="px-5 py-2.5 text-right font-semibold">Montant</th><th className="px-5 py-2.5 font-semibold">Échéance</th><th className="px-5 py-2.5 font-semibold">Payé le</th><th className="px-5 py-2.5 font-semibold">Statut</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Aucun impôt enregistré.</td></tr> : items.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-900">{i.type}</td>
                  <td className="px-5 py-3 text-slate-600">{i.periode ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{formatMontant(toNum(i.montant), "CDF")}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(i.echeance)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(i.datePaiement)}</td>
                  <td className="px-5 py-3"><span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${i.statut === "paye" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{i.statut === "paye" ? "Payé" : "À payer"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
