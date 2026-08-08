import { TrendingUp, TrendingDown, Wallet, FileDown, FileSpreadsheet } from "lucide-react";
import { getBilanGlobal, getEvolutionMensuelle } from "@/lib/bilan";
import { TVA_TAUX } from "@/lib/fiscal";
import { Card } from "@/components/agriculture/ui";
import { BilanPeriodSelector } from "@/components/erp/bilan-period-selector";
import { BilanEvolutionChart } from "@/components/erp/bilan-evolution-chart";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export default async function BilanPage({ searchParams }: { searchParams: Promise<{ annee?: string; mois?: string }> }) {
  const { annee, mois } = await searchParams;
  const an = Number(annee) || new Date().getFullYear();
  const mo = mois ? Number(mois) : null;
  const periodeLabel = mo ? `${["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][mo]} ${an}` : `Année ${an}`;

  const [bilan, evolution, bilanA1, bilanA2] = await Promise.all([
    getBilanGlobal(an, mo), getEvolutionMensuelle(an), getBilanGlobal(an - 1), getBilanGlobal(an - 2),
  ]);

  // Calculs impôts/taxes
  const impots = (recettes: number) => Math.round(recettes * TVA_TAUX);
  const beneficeNet = (recettes: number, depenses: number) => recettes - depenses - impots(recettes);
  const rentabilite = (bn: number, recettes: number) => recettes > 0 ? Math.round((bn / recettes) * 100) : 0;

  const tRec = bilan.totalRecettes, tDep = bilan.totalDepenses;
  const tImp = impots(tRec), tBN = beneficeNet(tRec, tDep), tRent = rentabilite(tBN, tRec);

  const kpis = [
    { label: "Recettes totales", value: formatMontant(tRec, "CDF"), tint: "bg-emerald-50 text-emerald-700" },
    { label: "Dépenses totales", value: formatMontant(tDep, "CDF"), tint: "bg-red-50 text-danger" },
    { label: "Impôts/Taxes (TVA estimée)", value: formatMontant(tImp, "CDF"), tint: "bg-or/15 text-[#c08700]" },
    { label: "Bénéfice net", value: formatMontant(tBN, "CDF"), tint: tBN >= 0 ? "bg-marine/10 text-marine" : "bg-red-50 text-danger" },
  ];

  const annees = [
    { an: an, recettes: tRec, depenses: tDep, benefice: tBN },
    { an: an - 1, recettes: bilanA1.totalRecettes, depenses: bilanA1.totalDepenses, benefice: beneficeNet(bilanA1.totalRecettes, bilanA1.totalDepenses) },
    { an: an - 2, recettes: bilanA2.totalRecettes, depenses: bilanA2.totalDepenses, benefice: beneficeNet(bilanA2.totalRecettes, bilanA2.totalDepenses) },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Tableau de bord général</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Analyse consolidée — {periodeLabel}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BilanPeriodSelector annee={an} mois={mois ?? ""} />
          <a href={`/api/bilan/pdf?annee=${an}${mois ? `&mois=${mois}` : ""}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-marine px-4 py-2 text-sm font-bold text-white transition hover:bg-marine-clair">📄 PDF</a>
          <a href={`/api/bilan/excel?annee=${an}${mois ? `&mois=${mois}` : ""}`} className="inline-flex items-center gap-2 rounded-xl bg-succes px-4 py-2 text-sm font-bold text-white transition hover:brightness-95">📗 Excel</a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5"><p className="text-sm font-medium text-slate-500">{k.label}</p><p className={`mt-2 font-display text-xl font-bold ${k.tint.includes("marine") ? "text-marine" : k.tint.includes("emerald") ? "text-emerald-700" : k.tint.includes("danger") ? "text-danger" : "text-[#c08700]"}`}>{k.value}</p></Card>
        ))}
      </div>

      {/* === RG-FIN-04 : Analyse consolidée par activité === */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5"><h2 className="font-display text-sm font-bold text-slate-900">Analyse consolidée par activité — {periodeLabel}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Activité</th>
              <th className="px-5 py-2.5 text-right font-semibold">Recettes</th>
              <th className="px-5 py-2.5 text-right font-semibold">Dépenses</th>
              <th className="px-5 py-2.5 text-right font-semibold">Impôts/Taxes</th>
              <th className="px-5 py-2.5 text-right font-semibold">Bénéfice net</th>
              <th className="px-5 py-2.5 text-right font-semibold">Rentabilité</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {bilan.services.map((s) => {
                const imp = impots(s.recettes); const bn = beneficeNet(s.recettes, s.depenses); const r = rentabilite(bn, s.recettes);
                return (
                  <tr key={s.service} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3"><span className="mr-2 text-lg">{s.emoji}</span><span className="font-semibold text-slate-900">{s.service}</span></td>
                    <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(s.recettes, "CDF")}</td>
                    <td className="px-5 py-3 text-right text-danger">{formatMontant(s.depenses, "CDF")}</td>
                    <td className="px-5 py-3 text-right text-[#c08700]">{formatMontant(imp, "CDF")}</td>
                    <td className={`px-5 py-3 text-right font-bold ${bn >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(bn, "CDF")}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${r >= 0 ? "text-emerald-600" : "text-danger"}`}>{r} %</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr className="bg-marine font-bold text-white">
              <td className="px-5 py-3">TOTAL ENTREPRISE</td>
              <td className="px-5 py-3 text-right">{formatMontant(tRec, "CDF")}</td>
              <td className="px-5 py-3 text-right">{formatMontant(tDep, "CDF")}</td>
              <td className="px-5 py-3 text-right">{formatMontant(tImp, "CDF")}</td>
              <td className="px-5 py-3 text-right">{formatMontant(tBN, "CDF")}</td>
              <td className="px-5 py-3 text-right">{tRent} %</td>
            </tr></tfoot>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* === Comparaison mensuelle === */}
        {!mo && (
          <Card className="overflow-hidden lg:col-span-3">
            <div className="border-b border-slate-100 px-5 py-3.5"><h2 className="font-display text-sm font-bold text-slate-900">Comparaison mensuelle — {an}</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2 font-semibold">Mois</th>
                  <th className="px-5 py-2 text-right font-semibold">Recettes</th>
                  <th className="px-5 py-2 text-right font-semibold">Dépenses</th>
                  <th className="px-5 py-2 text-right font-semibold">Bénéfice</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {evolution.map((p) => (
                    <tr key={p.mois} className={`hover:bg-slate-50/60 ${p.recettes === 0 && p.depenses === 0 ? "opacity-40" : ""}`}>
                      <td className="px-5 py-2 font-medium text-slate-700">{p.mois}</td>
                      <td className="px-5 py-2 text-right text-emerald-600">{formatMontant(p.recettes, "CDF")}</td>
                      <td className="px-5 py-2 text-right text-danger">{formatMontant(p.depenses, "CDF")}</td>
                      <td className={`px-5 py-2 text-right font-semibold ${p.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(p.benefice, "CDF")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="bg-slate-100 font-bold">
                  <td className="px-5 py-2.5 text-slate-700">TOTAL ANNUEL</td>
                  <td className="px-5 py-2.5 text-right text-emerald-600">{formatMontant(evolution.reduce((s, p) => s + p.recettes, 0), "CDF")}</td>
                  <td className="px-5 py-2.5 text-right text-danger">{formatMontant(evolution.reduce((s, p) => s + p.depenses, 0), "CDF")}</td>
                  <td className={`px-5 py-2.5 text-right ${bilan.beneficeNet >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(bilan.beneficeNet, "CDF")}</td>
                </tr></tfoot>
              </table>
            </div>
          </Card>
        )}

        {/* === Graphique évolution === */}
        <Card className={`p-6 ${mo ? "lg:col-span-5" : "lg:col-span-2"}`}>
          <h2 className="mb-1 font-display text-sm font-bold text-slate-900">Évolution {an}</h2>
          <p className="mb-3 text-xs text-slate-400">Recettes vs dépenses vs bénéfice.</p>
          <BilanEvolutionChart data={evolution} />
        </Card>
      </div>

      {/* === Comparaison annuelle === */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5"><h2 className="font-display text-sm font-bold text-slate-900">Comparaison annuelle — Historique</h2>
        <p className="text-xs text-slate-400">L'entreprise progresse-t-elle ? Quelle année a été la plus rentable ?</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Année</th>
              <th className="px-5 py-2.5 text-right font-semibold">Recettes</th>
              <th className="px-5 py-2.5 text-right font-semibold">Dépenses</th>
              <th className="px-5 py-2.5 text-right font-semibold">Bénéfices</th>
              <th className="px-5 py-2.5 text-right font-semibold">Tendance</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {annees.map((a, i) => {
                const prev = annees[i + 1];
                const progression = prev && prev.recettes > 0 ? Math.round(((a.recettes - prev.recettes) / prev.recettes) * 100) : null;
                return (
                  <tr key={a.an} className={`hover:bg-slate-50/60 ${i === 0 ? "bg-marine/5" : ""}`}>
                    <td className="px-5 py-3 font-bold text-slate-900">{a.an}{i === 0 && <span className="ml-2 rounded-full bg-marine/10 px-2 py-0.5 text-[10px] text-marine">Année courante</span>}</td>
                    <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(a.recettes, "CDF")}</td>
                    <td className="px-5 py-3 text-right text-danger">{formatMontant(a.depenses, "CDF")}</td>
                    <td className={`px-5 py-3 text-right font-bold ${a.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(a.benefice, "CDF")}</td>
                    <td className="px-5 py-3 text-right">
                      {progression !== null ? (
                        <span className={`font-semibold ${progression >= 0 ? "text-emerald-600" : "text-danger"}`}>{progression >= 0 ? "↑" : "↓"} {Math.abs(progression)} %</span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-center text-xs text-slate-400">
        RG-FIN-01 : Toutes les opérations sont rattachées à une activité · RG-FIN-02 : Calculs auto par activité/mois/année · RG-FIN-03 : Total consolidé · RG-FIN-04 : Détail + total affichés
      </p>
    </div>
  );
}
