import Link from "next/link";
import { HardHat, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getProjetsSynthese } from "@/lib/soustraitance/analyse";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "Construction", label: "Construction" },
  { value: "Réhabilitation de routes", label: "Réhabilitation de routes" },
  { value: "Bâtiments", label: "Bâtiments" },
  { value: "Forages", label: "Forages" },
  { value: "Autres travaux", label: "Autres travaux" },
];

export default async function SousTraitancePage() {
  const synthese = await getProjetsSynthese();
  const budgetTotal = synthese.reduce((s, p) => s + p.budget, 0);
  const encaisseTotal = synthese.reduce((s, p) => s + p.encaisse, 0);
  const beneficeTotal = synthese.reduce((s, p) => s + p.benefice, 0);
  const encours = synthese.filter((p) => p.statut === "encours").length;

    const beneficePrevuTotal = synthese.reduce((s, p) => s + p.beneficePrevu, 0);
    const projetsEncours = synthese.filter((p) => p.statut === "encours").length;
    const projetsTermines = synthese.filter((p) => p.statut === "termine").length;

    const kpis = [
    { label: "Projets en cours", value: formatNombre(projetsEncours, 0), icon: HardHat, tint: "bg-marine/10 text-marine" },
    { label: "Projets terminés", value: formatNombre(projetsTermines, 0), icon: Wallet, tint: "bg-succes/10 text-succes" },
    { label: "Bénéfice prévu (26.12)", value: formatMontant(beneficePrevuTotal, "CDF"), icon: TrendingUp, tint: "bg-ciel/10 text-ciel" },
    { label: "Bénéfice réel", value: formatMontant(beneficeTotal, "CDF"), icon: beneficeTotal >= 0 ? TrendingUp : HardHat, tint: beneficeTotal >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Travaux</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Sous-traitance</h1>
          <p className="mt-1 text-sm text-slate-500">Construction, routes, bâtiments, forages — contrats, équipes, coûts et bénéfices.</p>
        </div>
        <GenericForm endpoint="/api/sous-traitance/projects" title="Nouveau projet" triggerLabel="Nouveau projet" fields={[
          { name: "nom", label: "Nom du projet", required: true },
          { name: "type", label: "Type de travaux", type: "select", options: TYPES },
          { name: "client", label: "Client" },
          { name: "localisation", label: "Localisation" },
          { name: "budget", label: "Budget (CDF)", type: "number" },
          { name: "avancement", label: "Avancement (%)", type: "number" },
          { name: "dateDebut", label: "Début", type: "date" },
          { name: "dateFin", label: "Fin prévue", type: "date" },
          { name: "statut", label: "Statut", type: "select", options: [{ value: "encours", label: "En cours" }, { value: "termine", label: "Terminé" }, { value: "pause", label: "En pause" }] },
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

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Projets &amp; rentabilité</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Projet</th><th className="px-5 py-2.5 font-semibold">Type</th>
              <th className="px-5 py-2.5 font-semibold">Avancement</th><th className="px-5 py-2.5 text-right font-semibold">Budget</th>
              <th className="px-5 py-2.5 text-right font-semibold">Encaissé</th><th className="px-5 py-2.5 text-right font-semibold">Bénéfice</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {synthese.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Aucun projet.</td></tr>
              ) : synthese.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/sous-traitance/${p.id}`} className="font-semibold text-slate-900 hover:text-marine">{p.nom}</Link>
                    <p className="text-xs text-slate-400">{p.client ?? "—"} · {p.localisation ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.type ?? "—"}</td>
                  <td className="px-5 py-3.5 w-36">
                    <div className="mb-1 flex justify-end text-xs"><span className="font-bold text-slate-700">{formatNombre(p.avancement, 0)}%</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${p.avancement === 100 ? "bg-succes" : "bg-ciel"}`} style={{ width: `${Math.min(100, p.avancement)}%` }} /></div>
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{formatMontant(p.budget, "CDF")}</td>
                  <td className="px-5 py-3.5 text-right text-emerald-600">{formatMontant(p.encaisse, "CDF")}</td>
                  <td className={`px-5 py-3.5 text-right font-bold ${p.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(p.benefice, "CDF")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-slate-400">{encours} projet(s) en cours · {synthese.filter((p) => p.statut === "termine").length} terminé(s)</p>
    </div>
  );
}
