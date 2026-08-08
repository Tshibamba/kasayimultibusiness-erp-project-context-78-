import { db } from "@/db";
import { commerceProducts, sales } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { Package, Boxes, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { SaleStatusButton } from "@/components/erp/sale-status-button";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CommercePage() {
  const produits = await db.select().from(commerceProducts).orderBy(asc(commerceProducts.nom));
  const ventes = await db.select().from(sales).orderBy(desc(sales.date));

  const valeurStock = produits.reduce((s, p) => s + toNum(p.stock) * toNum(p.prixAchat), 0);
  const ca = ventes.filter((v) => v.statut === "PAYEE").reduce((s, v) => s + toNum(v.totalTTC), 0);
  const faibles = produits.filter((p) => toNum(p.stock) <= toNum(p.stockMin)).length;

  const stats = [
    { label: "Articles", value: formatNombre(produits.length, 0), icon: Package, tint: "bg-marine/10 text-marine" },
    { label: "Valeur du stock", value: formatMontant(valeurStock, "CDF"), icon: Boxes, tint: "bg-ciel/10 text-ciel" },
    { label: "CA encaissé", value: formatMontant(ca, "CDF"), icon: TrendingUp, tint: "bg-succes/10 text-succes" },
    { label: "Stocks faibles", value: formatNombre(faibles, 0), icon: AlertTriangle, tint: "bg-danger/10 text-danger" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Commerce</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Commerce général</h1>
        </div>
        <div className="flex gap-3">
          <GenericForm
            endpoint="/api/commerce/products"
            title="Nouvel article"
            triggerLabel="Nouvel article"
            fields={[
              { name: "nom", label: "Nom de l'article", required: true },
              { name: "categorie", label: "Catégorie" },
              { name: "unite", label: "Unité", placeholder: "sac, pièce, kg..." },
              { name: "prixAchat", label: "Prix d'achat (CDF)", type: "number" },
              { name: "prixVente", label: "Prix de vente (CDF)", type: "number" },
              { name: "stock", label: "Stock initial", type: "number" },
              { name: "stockMin", label: "Stock minimum (alerte)", type: "number" },
            ]}
          />
          <GenericForm
            endpoint="/api/commerce/sales"
            title="Nouvelle vente"
            description="La TVA (16%) est calculée automatiquement."
            triggerLabel="Nouvelle vente"
            triggerVariant="primary"
            fields={[
              { name: "client", label: "Client", placeholder: "Client comptant" },
              { name: "totalHT", label: "Montant HT (CDF)", type: "number", required: true },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className="mt-2 font-display text-xl font-bold text-slate-900">{s.value}</p>
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tint}`}><Icon size={20} /></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Articles en stock</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Article</th>
                <th className="px-5 py-2.5 font-semibold">Catégorie</th>
                <th className="px-5 py-2.5 text-right font-semibold">Stock</th>
                <th className="px-5 py-2.5 text-right font-semibold">Prix achat</th>
                <th className="px-5 py-2.5 text-right font-semibold">Prix vente</th>
                <th className="px-5 py-2.5 text-right font-semibold">Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {produits.map((p) => {
                const marge = toNum(p.prixVente) - toNum(p.prixAchat);
                const faible = toNum(p.stock) <= toNum(p.stockMin);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{p.nom}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.categorie ?? "—"}</td>
                    <td className={`px-5 py-3.5 text-right font-semibold ${faible ? "text-danger" : "text-slate-700"}`}>
                      {formatNombre(toNum(p.stock))} {p.unite}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">{formatMontant(toNum(p.prixAchat), "CDF")}</td>
                    <td className="px-5 py-3.5 text-right text-slate-700">{formatMontant(toNum(p.prixVente), "CDF")}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">+{formatMontant(marge, "CDF")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Ventes récentes</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Référence</th>
                <th className="px-5 py-2.5 font-semibold">Client</th>
                <th className="px-5 py-2.5 font-semibold">Date</th>
                <th className="px-5 py-2.5 text-right font-semibold">HT</th>
                <th className="px-5 py-2.5 text-right font-semibold">TVA</th>
                <th className="px-5 py-2.5 text-right font-semibold">TTC</th>
                <th className="px-5 py-2.5 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ventes.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{v.reference}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{v.client}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(v.date)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-500">{formatMontant(toNum(v.totalHT), "CDF")}</td>
                  <td className="px-5 py-3.5 text-right text-slate-500">{formatMontant(toNum(v.taxe), "CDF")}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatMontant(toNum(v.totalTTC), "CDF")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <SaleStatusButton saleId={v.id} statut={v.statut} />
                      <a
                        href={`/api/commerce/sales/${v.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-marine/10 px-2 py-0.5 text-xs font-bold text-marine transition hover:bg-marine hover:text-white"
                      >
                        📄 Facture
                      </a>
                    </div>
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
