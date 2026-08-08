import { FileDown, FileSpreadsheet, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { getRapportGlobal, syntheseModules, chartValeurs, chartRevenus } from "@/lib/rapports";
import { ValeursBarChart, RevenusPieChart } from "@/components/erp/rapports-charts";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RapportsPage() {
  const r = await getRapportGlobal();
  const synthese = syntheseModules(r);
  const dateDuJour = new Intl.DateTimeFormat("fr-CD", { dateStyle: "long", timeZone: "Africa/Lubumbashi" }).format(new Date());

  const kpis = [
    { label: "Trésorerie totale", value: formatMontant(r.tresorerie, "CDF"), tint: "bg-marine/10 text-marine" },
    { label: "CA encaissé (commerce)", value: formatMontant(r.caCommerce, "CDF"), tint: "bg-succes/10 text-succes" },
    { label: "Créances (impayés)", value: formatMontant(r.creances, "CDF"), tint: "bg-danger/10 text-danger" },
    { label: "Masse salariale / mois", value: formatMontant(r.masseSalariale, "CDF"), tint: "bg-ciel/10 text-ciel" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Pilotage</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Rapports centralisés</h1>
          <p className="mt-1 text-sm text-slate-500">Synthèse consolidée de toutes les activités — {dateDuJour}.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/rapports/excel"
            className="inline-flex items-center gap-2 rounded-xl bg-succes px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            <FileSpreadsheet size={16} /> Exporter Excel
          </a>
          <a
            href="/api/rapports/pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-marine px-4 py-2.5 text-sm font-bold text-white transition hover:bg-marine-clair"
          >
            <FileDown size={16} /> Exporter PDF
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-sm font-medium text-slate-500">{k.label}</p>
            <p className={`mt-2 font-display text-xl font-bold ${k.tint.split(" ").find((c) => c.startsWith("text-"))?.replace("text-", "text-")}`}>
              {k.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="font-display text-base font-bold text-slate-900">
            <TrendingUp size={16} className="mb-1 mr-1 inline text-marine" /> Valeurs par poste
          </h2>
          <p className="mb-3 text-xs text-slate-400">Stocks, trésorerie, masse salariale, flotte et budget chantiers (en FC).</p>
          <ValeursBarChart data={chartValeurs(r)} />
        </Card>
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display text-base font-bold text-slate-900">Répartition des revenus</h2>
          <p className="mb-3 text-xs text-slate-400">Commerce, transport et traiteur.</p>
          <RevenusPieChart data={chartRevenus(r)} />
        </Card>
      </div>

      {/* Synthèse par module */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">Synthèse par activité</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-semibold">Activité</th>
                <th className="px-6 py-3 font-semibold">Indicateur</th>
                <th className="px-6 py-3 text-right font-semibold">Montant (FC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {synthese.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3.5">
                    <span className="mr-2">{s.emoji}</span>
                    <span className="font-semibold text-slate-900">{s.module}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{s.indicateur}</td>
                  <td className="px-6 py-3.5 text-right font-bold" style={{ color: s.couleur }}>
                    {formatNombre(s.montant, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {r.agriAlertes > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="shrink-0" />
          {r.agriAlertes} alerte{r.agriAlertes > 1 ? "s" : ""} de stock active{r.agriAlertes > 1 ? "s" : ""} en agriculture — réapprovisionnement à prévoir.
        </div>
      )}
    </div>
  );
}
