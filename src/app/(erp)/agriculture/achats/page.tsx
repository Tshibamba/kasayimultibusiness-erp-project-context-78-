import { ShoppingCart, Wallet, Package, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { mouvementStock, fournisseur, produitIntrant } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { MouvementDialog } from "@/components/agriculture/mouvement-dialog";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AchatsPage() {
  const [achats, intrants] = await Promise.all([
    db
      .select({
        id: mouvementStock.id,
        produitNom: produitIntrant.nom,
        unite: produitIntrant.unite,
        quantite: mouvementStock.quantite,
        prixAchat: mouvementStock.prixAchat,
        valeur: mouvementStock.valeur,
        reference: mouvementStock.reference,
        fournisseurNom: fournisseur.nom,
        date: mouvementStock.createdAt,
      })
      .from(mouvementStock)
      .leftJoin(produitIntrant, eq(produitIntrant.id, mouvementStock.produitId))
      .leftJoin(fournisseur, eq(fournisseur.id, mouvementStock.fournisseurId))
      .where(eq(mouvementStock.type, "ENTREE"))
      .orderBy(desc(mouvementStock.createdAt)),
    db.select({ id: produitIntrant.id, nom: produitIntrant.nom, unite: produitIntrant.unite }).from(produitIntrant).orderBy(asc(produitIntrant.nom)),
  ]);

  const total = achats.reduce((s, a) => s + toNum(a.valeur), 0);
  const optionsProduits = intrants.map((i) => ({ id: i.id, nom: i.nom, unite: i.unite }));

  const kpis = [
    { label: "Total des achats", value: formatMontant(total, "CDF"), icon: Wallet, tint: "bg-marine/10 text-marine" },
    { label: "Approvisionnements", value: formatNombre(achats.length, 0), icon: ShoppingCart, tint: "bg-ciel/10 text-ciel" },
    { label: "Références intrants", value: formatNombre(intrants.length, 0), icon: Package, tint: "bg-or/15 text-[#c08700]" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Agriculture</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Achats d'intrants</h1>
          <p className="mt-1 text-sm text-slate-500">Approvisionnement en semences, engrais et produits phytosanitaires. Chaque achat augmente le stock et recalcule le CMUP.</p>
        </div>
        <MouvementDialog produits={optionsProduits} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="flex items-center gap-3 p-5">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${k.tint}`}><Icon size={22} /></div>
              <div><p className="text-xs text-slate-500">{k.label}</p><p className="font-display text-lg font-bold text-slate-900">{k.value}</p></div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Historique des achats (entrées de stock)</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Date</th>
                <th className="px-5 py-2.5 font-semibold">Produit</th>
                <th className="px-5 py-2.5 text-right font-semibold">Quantité</th>
                <th className="px-5 py-2.5 text-right font-semibold">P.U. (FC)</th>
                <th className="px-5 py-2.5 font-semibold">Fournisseur</th>
                <th className="px-5 py-2.5 font-semibold">Référence</th>
                <th className="px-5 py-2.5 text-right font-semibold">Valeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {achats.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">Aucun achat enregistré.</td></tr>
              ) : achats.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{formatDate(a.date)}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{a.produitNom ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{formatNombre(toNum(a.quantite))} {a.unite ?? ""}</td>
                  <td className="px-5 py-3.5 text-right text-slate-500">{formatMontant(toNum(a.prixAchat), "CDF")}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.fournisseurNom ?? "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{a.reference ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatMontant(toNum(a.valeur), "CDF")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold">
                <td colSpan={6} className="px-5 py-3 text-right text-slate-500">Total</td>
                <td className="px-5 py-3 text-right text-marine">{formatMontant(total, "CDF")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
