import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, EmptyState, StatutStockBadge, CategorieChip } from "@/components/agriculture/ui";
import { ProduitDialog } from "@/components/agriculture/produit-dialog";
import { SeedButton } from "@/components/agriculture/seed-button";
import { getStocksListe } from "@/lib/agriculture/stock-service";
import { formatMontant, formatNombre } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProduitsPage() {
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
        <Header />
        <div className="mt-8">
          <EmptyState
            emoji="🌱"
            title="Aucun produit"
            description="Créez votre premier intrant ou chargez les données de démonstration."
            action={<SeedButton />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header />
        <ProduitDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((i) => (
          <Link key={i.produitId} href={`/agriculture/stocks/${i.produitId}`}>
            <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(27,79,114,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CategorieChip categorie={i.categorie} />
                  <h3 className="mt-2 truncate font-display text-base font-bold text-slate-900 group-hover:text-marine">
                    {i.nom}
                  </h3>
                </div>
                <StatutStockBadge statut={i.statut} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Quantité</p>
                  <p className="font-bold text-slate-900">
                    {formatNombre(i.quantite)}{" "}
                    <span className="text-xs font-normal text-slate-400">{i.unite}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">CMUP</p>
                  <p className="font-bold text-slate-900">{formatMontant(i.cmup, "CDF")}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Seuil alerte</p>
                  <p className="font-semibold text-amber-600">
                    {formatNombre(i.seuilAlerte)} {i.unite}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Seuil critique</p>
                  <p className="font-semibold text-danger">
                    {formatNombre(i.seuilCritique)} {i.unite}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end text-sm font-semibold text-ciel group-hover:text-marine">
                Voir la fiche <ChevronRight size={16} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <p className="text-sm font-medium text-ciel">Catalogue</p>
      <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
        Produits intrants
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Semences, engrais, pesticides — fiches produits et seuils de réapprovisionnement.
      </p>
    </div>
  );
}
