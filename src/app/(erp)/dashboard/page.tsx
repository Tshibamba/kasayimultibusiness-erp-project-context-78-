import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, BellRing, ArrowRight, AlertTriangle, Sprout, ShoppingCart, Truck, HardHat, UtensilsCrossed, UserCog, Calculator } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { getBilanGlobal } from "@/lib/bilan";
import { getAlertes } from "@/lib/agriculture/stock-service";
import { Card } from "@/components/agriculture/ui";
import { ValeursBarChart } from "@/components/erp/rapports-charts";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

const MODULES = [
  { nom: "Agriculture", icon: Sprout, href: "/agriculture/stocks", desc: "Stocks, production, ventes" },
  { nom: "Commerce", icon: ShoppingCart, href: "/commerce", desc: "Articles, ventes, TVA" },
  { nom: "Transport", icon: Truck, href: "/transport", desc: "Véhicules, trajets, carburant" },
  { nom: "Sous-traitance", icon: HardHat, href: "/sous-traitance", desc: "Projets, contrats, bénéfices" },
  { nom: "Service traiteur", icon: UtensilsCrossed, href: "/traiteur", desc: "Événements, menus, stock" },
  { nom: "Ressources humaines", icon: UserCog, href: "/rh", desc: "Employés, paie, bulletins" },
  { nom: "Comptabilité", icon: Calculator, href: "/comptabilite", desc: "Caisses, banques, mouvements" },
  { nom: "Bilan financier", icon: TrendingUp, href: "/bilan", desc: "Bilan par activité + global" },
];

export default async function DashboardPage() {
  const year = new Date().getFullYear();
  const [bilan, alertes] = await Promise.all([
    getBilanGlobal(year),
    getAlertes(true).catch(() => []),
  ]);

  const [{ count: nbUsers }] = (await db.select({ count: sql<number>`count(*)::int` }).from(users).catch(() => [{ count: 0 }])) as { count: number }[];

  const kpis = [
    { label: `Recettes ${year}`, value: formatMontant(bilan.totalRecettes, "CDF"), icon: TrendingUp, tint: "bg-emerald-50 text-emerald-700" },
    { label: `Dépenses ${year}`, value: formatMontant(bilan.totalDepenses, "CDF"), icon: TrendingDown, tint: "bg-red-50 text-danger" },
    { label: `Bénéfice net ${year}`, value: formatMontant(bilan.beneficeNet, "CDF"), icon: Wallet, tint: bilan.beneficeNet >= 0 ? "bg-marine/10 text-marine" : "bg-red-50 text-danger" },
    { label: "Alertes actives", value: formatNombre(alertes.length, 0), icon: BellRing, tint: alertes.length > 0 ? "bg-or/15 text-[#c08700]" : "bg-emerald-50 text-emerald-700" },
  ];

  const chartData = bilan.services.map((s) => ({ module: s.emoji + " " + s.service.split(" ")[0], valeur: s.benefice }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Vue d'ensemble financière et opérationnelle — Année {year}.</p>
      </div>

      {/* KPIs financiers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{k.label}</p>
                  <p className="mt-2 font-display text-xl font-bold text-slate-900">{k.value}</p>
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.tint}`}><Icon size={20} /></div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Bénéfice par activité */}
        <Card className="p-6 lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">Bénéfice par activité — {year}</h2>
            <Link href="/bilan" className="text-sm font-semibold text-ciel hover:text-marine">Détails →</Link>
          </div>
          <p className="mb-4 text-xs text-slate-400">Recettes − dépenses par service (en FC).</p>
          <ValeursBarChart data={chartData} />
        </Card>

        {/* Synthèse par activité */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3 font-display text-sm font-bold text-slate-900">Synthèse par activité</div>
          <div className="divide-y divide-slate-50">
            {bilan.services.map((s) => (
              <div key={s.service} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-slate-700">{s.emoji} {s.service}</span>
                <div className="text-right">
                  <p className={`font-display text-sm font-bold ${s.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(s.benefice, "CDF")}</p>
                  <p className="text-xs text-slate-400">R: {formatMontant(s.recettes, "CDF")} · D: {formatMontant(s.depenses, "CDF")}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alertes prioritaires */}
      {alertes.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><AlertTriangle size={15} className="mb-0.5 mr-1 inline text-or" />Alertes prioritaires ({alertes.length})</h2>
            <Link href="/agriculture/stocks/alertes" className="text-sm font-semibold text-ciel hover:text-marine">Tout voir →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {alertes.slice(0, 5).map((a) => (
              <Link key={a.id} href={`/agriculture/stocks/${a.produitId}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${a.niveau === "CRITIQUE" || a.niveau === "DANGER" ? "bg-red-50 text-danger" : "bg-amber-50 text-amber-600"}`}>
                  <BellRing size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{a.nom}</p>
                  <p className="truncate text-xs text-slate-400">{a.message}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-danger">{formatNombre(Number(a.quantite))} {a.unite}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Accès rapide aux modules */}
      <div>
        <h2 className="mb-3 font-display text-lg font-bold text-slate-900">Modules</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.nom} href={m.href}>
                <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-marine/10 text-marine transition group-hover:bg-marine group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-slate-900">{m.nom}</h3>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
