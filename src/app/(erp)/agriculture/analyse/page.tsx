import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { ValeursBarChart } from "@/components/erp/rapports-charts";
import { getProductionSynthese } from "@/lib/agriculture/production";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalysePage() {
  const synthese = await getProductionSynthese();
  const margeTotale = synthese.reduce((s, c) => s + c.marge, 0);
  const coutTotal = synthese.reduce((s, c) => s + c.coutTotal, 0);
  const revenuTotal = synthese.reduce((s, c) => s + c.revenu, 0);
  const rentabilite = coutTotal > 0 ? Math.round((margeTotale / coutTotal) * 100) : 0;

  const chart = synthese.map((c) => ({ module: c.nom.length > 14 ? c.nom.slice(0, 13) + "…" : c.nom, valeur: c.marge }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link href="/agriculture/production" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-marine">
        <ArrowLeft size={15} /> Production
      </Link>
      <div>
        <p className="text-sm font-medium text-ciel">Agriculture</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Analyse de rentabilité</h1>
        <p className="mt-1 text-sm text-slate-500">Coûts (intrants + main d'œuvre) comparés aux revenus des ventes, par culture.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Coûts totaux", value: formatMontant(coutTotal, "CDF"), color: "text-danger" },
          { label: "Revenus totaux", value: formatMontant(revenuTotal, "CDF"), color: "text-succes" },
          { label: "Marge globale", value: formatMontant(margeTotale, "CDF"), color: margeTotale >= 0 ? "text-emerald-600" : "text-danger" },
          { label: "Rentabilité", value: `${formatNombre(rentabilite, 0)} %`, color: "text-marine" },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-sm font-medium text-slate-500">{k.label}</p>
            <p className={`mt-2 font-display text-xl font-bold ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="mb-1 font-display text-base font-bold text-slate-900"><TrendingUp size={16} className="mb-1 mr-1 inline text-marine" />Marge nette par culture</h2>
        <p className="mb-4 text-xs text-slate-400">Barres positives (bénéfice) / négatives (déficit), en FC.</p>
        <ValeursBarChart data={chart} />
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Détail par culture</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Culture</th>
                <th className="px-5 py-2.5 text-right font-semibold">Coûts</th>
                <th className="px-5 py-2.5 text-right font-semibold">Revenu</th>
                <th className="px-5 py-2.5 text-right font-semibold">Marge</th>
                <th className="px-5 py-2.5 text-right font-semibold">Rentabilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {synthese.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Aucune donnée.</td></tr>
              ) : synthese.map((c) => {
                const r = c.coutTotal > 0 ? Math.round((c.marge / c.coutTotal) * 100) : 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5"><Link href={`/agriculture/production/${c.id}`} className="font-semibold text-slate-900 hover:text-marine">{c.nom}</Link></td>
                    <td className="px-5 py-3.5 text-right text-danger">{formatMontant(c.coutTotal, "CDF")}</td>
                    <td className="px-5 py-3.5 text-right text-succes">{formatMontant(c.revenu, "CDF")}</td>
                    <td className={`px-5 py-3.5 text-right font-bold ${c.marge >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(c.marge, "CDF")}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${r >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatNombre(r, 0)} %</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
