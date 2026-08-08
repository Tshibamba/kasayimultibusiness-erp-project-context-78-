import Link from "next/link";
import { Boxes, Wallet, AlertTriangle, BellRing, Search } from "lucide-react";
import {
  Card,
  EmptyState,
  StatutStockBadge,
  CategorieChip,
  StockBar,
} from "@/components/agriculture/ui";
import { MouvementDialog } from "@/components/agriculture/mouvement-dialog";
import { ProduitDialog } from "@/components/agriculture/produit-dialog";
import { SeedButton } from "@/components/agriculture/seed-button";
import { getStocksListe } from "@/lib/agriculture/stock-service";
import { CATEGORIES, categorieLabel } from "@/lib/ui/agriculture";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StocksPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  let data: Awaited<ReturnType<typeof getStocksListe>> = {
    items: [],
    stats: { totalProduits: 0, valeurTotale: 0, enAlerte: 0, critiques: 0, ruptures: 0, ok: 0 },
  };
  try {
    data = await getStocksListe();
  } catch {
    /* ignore */
  }

  if (data.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader />
        <div className="mt-8">
          <EmptyState
            emoji="📦"
            title="Aucun stock enregistré"
            description="Ajoutez vos premiers intrants ou chargez les données de démonstration pour commencer."
            action={<SeedButton />}
          />
        </div>
      </div>
    );
  }

  const filtre = categorie ?? "TOUS";
  const items = filtre === "TOUS" ? data.items : data.items.filter((i) => i.categorie === filtre);
  const { stats } = data;

  const minis = [
    { label: "Valeur totale", value: formatMontant(stats.valeurTotale, "CDF"), icon: Wallet, tint: "text-marine" },
    { label: "Références", value: formatNombre(stats.totalProduits, 0), icon: Boxes, tint: "text-ciel" },
    { label: "Alertes", value: formatNombre(stats.enAlerte + stats.critiques + stats.ruptures, 0), icon: BellRing, tint: "text-or" },
    { label: "Ruptures", value: formatNombre(stats.ruptures, 0), icon: AlertTriangle, tint: "text-danger" },
  ];

  const optionsProduits = data.items.map((i) => ({ id: i.produitId, nom: i.nom, unite: i.unite }));
  const categoriesPresentes = Array.from(new Set(data.items.map((i) => i.categorie)));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader />
        <div className="flex gap-3">
          <ProduitDialog />
          <MouvementDialog produits={optionsProduits} />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {minis.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="flex items-center gap-3 p-4">
              <Icon size={22} className={m.tint} />
              <div>
                <p className="text-lg font-bold text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-500">{m.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filtres catégorie */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/agriculture/stocks"
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            filtre === "TOUS"
              ? "bg-marine text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          Toutes
        </Link>
        {categoriesPresentes.map((c) => {
          const cat = CATEGORIES.find((x) => x.value === c);
          return (
            <Link
              key={c}
              href={`/agriculture/stocks?categorie=${c}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                filtre === c
                  ? "bg-marine text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat?.emoji} {cat?.label ?? categorieLabel(c)}
            </Link>
          );
        })}
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Search size={13} /> {items.length} produit{items.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Produit</th>
                <th className="px-5 py-3 font-semibold">Quantité</th>
                <th className="px-5 py-3 font-semibold">Niveau</th>
                <th className="px-5 py-3 text-right font-semibold">CMUP</th>
                <th className="px-5 py-3 text-right font-semibold">Valeur</th>
                <th className="px-5 py-3 text-right font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((i) => (
                <tr key={i.produitId} className="group transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/agriculture/stocks/${i.produitId}`}
                      className="font-semibold text-slate-900 group-hover:text-marine"
                    >
                      {i.nom}
                    </Link>
                    <div className="mt-1">
                      <CategorieChip categorie={i.categorie} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900">
                      {formatNombre(i.quantite)}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">{i.unite}</span>
                  </td>
                  <td className="px-5 py-3.5 w-44">
                    <StockBar
                      quantite={i.quantite}
                      seuilAlerte={i.seuilAlerte}
                      seuilCritique={i.seuilCritique}
                      unite={i.unite}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-600">
                    {formatMontant(i.cmup, "CDF")}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {formatMontant(i.valeurStock, "CDF")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StatutStockBadge statut={i.statut} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <p className="text-sm font-medium text-ciel">Stocks</p>
      <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
        Fiches de stock des intrants
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Semences, engrais, pesticides et autres — valorisation au CMUP.
      </p>
    </div>
  );
}
