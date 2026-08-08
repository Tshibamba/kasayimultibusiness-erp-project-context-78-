import Link from "next/link";
import {
  Boxes,
  Wallet,
  BellRing,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Card, EmptyState, StatutStockBadge, NiveauAlerteBadge } from "@/components/agriculture/ui";
import { SeedButton } from "@/components/agriculture/seed-button";
import { getStocksListe, getAlertes } from "@/lib/agriculture/stock-service";
import { formatMontant, formatNombre, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof getStocksListe>> = {
    items: [],
    stats: { totalProduits: 0, valeurTotale: 0, enAlerte: 0, critiques: 0, ruptures: 0, ok: 0 },
  };
  let alertes: Awaited<ReturnType<typeof getAlertes>> = [];
  try {
    data = await getStocksListe();
    alertes = await getAlertes(true);
  } catch {
    /* db pas prêt */
  }

  if (data.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <HeroHeader />
        <div className="mt-8">
          <EmptyState
            emoji="🌱"
            title="Bienvenue dans le module Agriculture"
            description="Aucun intrant n'a encore été enregistré. Chargez un jeu de données de démonstration (semences, engrais, pesticides…) pour découvrir la gestion des stocks, le calcul du CMUP et les alertes automatiques."
            action={<SeedButton />}
          />
        </div>
      </div>
    );
  }

  const { stats } = data;
  const enSurveillance = data.items
    .filter((i) => i.statut !== "OK")
    .sort((a, b) => {
      const ordre: Record<string, number> = { RUPTURE: 0, CRITIQUE: 1, FAIBLE: 2, SURSTOCK: 3 };
      return (ordre[a.statut] ?? 9) - (ordre[b.statut] ?? 9);
    })
    .slice(0, 6);

  const repartition = [
    { label: "En stock", value: stats.ok, color: "bg-succes" },
    { label: "Faible", value: stats.enAlerte, color: "bg-amber-500" },
    { label: "Critique", value: stats.critiques, color: "bg-orange-500" },
    { label: "Rupture", value: stats.ruptures, color: "bg-danger" },
  ];
  const totalRep = stats.ok + stats.enAlerte + stats.critiques + stats.ruptures || 1;

  const kpis = [
    {
      label: "Valeur du stock",
      value: formatMontant(stats.valeurTotale, "CDF"),
      sub: "Coût Moyen Unitaire Pondéré (CMUP)",
      icon: Wallet,
      tint: "bg-marine/10 text-marine",
    },
    {
      label: "Produits suivis",
      value: formatNombre(stats.totalProduits, 0),
      sub: "Intrants en gestion",
      icon: Boxes,
      tint: "bg-ciel/10 text-ciel",
    },
    {
      label: "Alertes actives",
      value: formatNombre(alertes.length, 0),
      sub: `${stats.critiques + stats.ruptures} prioritaires`,
      icon: BellRing,
      tint: "bg-or/15 text-[#c08700]",
    },
    {
      label: "Ruptures de stock",
      value: formatNombre(stats.ruptures, 0),
      sub: "Réapprovisionner immédiatement",
      icon: AlertTriangle,
      tint: "bg-danger/10 text-danger",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <HeroHeader />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{k.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-slate-900">
                    {k.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{k.sub}</p>
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.tint}`}>
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Répartition des statuts */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-display text-base font-bold text-slate-900">
            État global des stocks
          </h3>
          <div className="mt-5 space-y-4">
            {repartition.map((r) => (
              <div key={r.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                    {r.label}
                  </span>
                  <span className="font-semibold text-slate-900">{r.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${r.color}`}
                    style={{ width: `${(r.value / totalRep) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertes prioritaires */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900">
              Alertes prioritaires
            </h3>
            <Link
              href="/agriculture/stocks/alertes"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ciel hover:text-marine"
            >
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          {alertes.length === 0 ? (
            <div className="grid h-40 place-items-center rounded-xl bg-emerald-50 text-sm font-medium text-emerald-700">
              ✅ Aucune alerte — tous les stocks sont au-dessus des seuils.
            </div>
          ) : (
            <div className="space-y-2.5">
              {alertes.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={`/agriculture/stocks/${a.produitId}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-ciel/40 hover:bg-ciel/5"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-danger">
                    <BellRing size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {a.nom}
                      </p>
                      <NiveauAlerteBadge niveau={a.niveau} />
                    </div>
                    <p className="truncate text-xs text-slate-500">{a.message}</p>
                  </div>
                  <span className="shrink-0 text-right text-xs">
                    <span className="block font-bold text-slate-900">
                      {formatNombre(toNum(a.quantite))} {a.unite}
                    </span>
                    <span className="text-slate-400">restant</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Produits à surveiller */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-display text-base font-bold text-slate-900">
            <TrendingDown size={16} className="mb-1 mr-1 inline text-or" />
            Produits à surveiller
          </h3>
          <Link
            href="/agriculture/stocks"
            className="text-sm font-semibold text-ciel hover:text-marine"
          >
            Voir tous les stocks
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {enSurveillance.map((i) => (
            <Link
              key={i.produitId}
              href={`/agriculture/stocks/${i.produitId}`}
              className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{i.nom}</p>
                <p className="text-xs text-slate-400">
                  CMUP {formatMontant(i.cmup, "CDF")} · seuil alerte {i.seuilAlerte} {i.unite}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  {formatNombre(i.quantite)} {i.unite}
                </p>
              </div>
              <StatutStockBadge statut={i.statut} />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function HeroHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-ciel">Module Agriculture</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
          Gestion des stocks d'intrants
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivi des semences, engrais et pesticides · CMUP automatique · alertes multi-niveaux.
        </p>
      </div>
    </div>
  );
}
