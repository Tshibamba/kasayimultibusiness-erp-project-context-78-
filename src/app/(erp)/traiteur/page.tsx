import Link from "next/link";
import { db } from "@/db";
import { events, cateringOrder, menu as menuTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { UtensilsCrossed, Wallet, TrendingUp, AlertTriangle, ShoppingCart, BookOpen, Package } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getEventsSynthese, getStockAlimentaire } from "@/lib/traiteur/analyse";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TraiteurPage() {
  const [{ items: evenements, caPotentiel, beneficeTotal }, stock, commandes, menus] = await Promise.all([
    getEventsSynthese(),
    getStockAlimentaire(),
    db.select().from(cateringOrder).orderBy(desc(cateringOrder.createdAt)),
    db.select().from(menuTable).orderBy(desc(menuTable.createdAt)),
  ]);

  const ingredientOptions = stock.items.map((i) => ({ value: String(i.id), label: `${i.nom} (${i.unite ?? "u"})` }));

  const kpis = [
    { label: "Événements", value: formatNombre(evenements.length, 0), icon: UtensilsCrossed, tint: "bg-marine/10 text-marine" },
    { label: "CA potentiel", value: formatMontant(caPotentiel, "CDF"), icon: Wallet, tint: "bg-ciel/10 text-ciel" },
    { label: "Bénéfice total", value: formatMontant(beneficeTotal, "CDF"), icon: TrendingUp, tint: beneficeTotal >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger" },
    { label: "Alertes stock", value: formatNombre(stock.alertes, 0), icon: AlertTriangle, tint: stock.alertes > 0 ? "bg-danger/10 text-danger" : "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Services</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Service traiteur</h1>
          <p className="mt-1 text-sm text-slate-500">Commandes, événements, menus, stock alimentaire, personnel, facturation et bénéfices.</p>
        </div>
        <GenericForm endpoint="/api/traiteur/events" title="Nouvel événement" triggerLabel="Nouvel événement" fields={[
          { name: "nomClient", label: "Client", required: true },
          { name: "typeEvenement", label: "Type", type: "select", options: [{ value: "Mariage", label: "Mariage" }, { value: "Séminaire", label: "Séminaire" }, { value: "Anniversaire", label: "Anniversaire" }, { value: "Conférence", label: "Conférence" }, { value: "Autre", label: "Autre" }] },
          { name: "dateEvenement", label: "Date", type: "date" }, { name: "lieu", label: "Lieu" },
          { name: "nbInvites", label: "Invités", type: "number" }, { name: "montantTotal", label: "Montant (CDF)", type: "number" },
          { name: "statut", label: "Statut", type: "select", options: [{ value: "planifie", label: "Planifié" }, { value: "confirme", label: "Confirmé" }, { value: "termine", label: "Terminé" }] },
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

      {/* Événements & bénéfices */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Événements &amp; bénéfices</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Client</th><th className="px-5 py-2.5 font-semibold">Date</th>
              <th className="px-5 py-2.5 text-right font-semibold">Invités</th><th className="px-5 py-2.5 text-right font-semibold">Montant</th>
              <th className="px-5 py-2.5 text-right font-semibold">Coûts</th><th className="px-5 py-2.5 text-right font-semibold">Bénéfice</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {evenements.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Aucun événement.</td></tr> : evenements.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5"><Link href={`/traiteur/${e.id}`} className="font-semibold text-slate-900 hover:text-marine">{e.nomClient}</Link><p className="text-xs text-slate-400">{e.typeEvenement ?? "—"} · {e.lieu ?? "—"}</p></td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(e.dateEvenement)}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{e.nbInvites ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatMontant(e.montantTotal, "CDF")}</td>
                  <td className="px-5 py-3.5 text-right text-danger">{formatMontant(e.depenses + e.personnel, "CDF")}</td>
                  <td className={`px-5 py-3.5 text-right font-bold ${e.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(e.benefice, "CDF")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Commandes */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><ShoppingCart size={15} className="mb-0.5 mr-1 inline text-marine" />Commandes ({commandes.length})</h2>
            <GenericForm endpoint="/api/traiteur/orders" title="Nouvelle commande" triggerLabel="Commande" triggerVariant="outline" fields={[
              { name: "client", label: "Client", required: true }, { name: "telephone", label: "Téléphone" },
              { name: "dateSouhaitee", label: "Date souhaitée", type: "date" }, { name: "nbPersonnes", label: "Personnes", type: "number" },
              { name: "description", label: "Détails", type: "textarea" }, { name: "statut", label: "Statut", type: "select", options: [{ value: "nouvelle", label: "Nouvelle" }, { value: "confirmee", label: "Confirmée" }, { value: "terminee", label: "Terminée" }] },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {commandes.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{c.client}</p><p className="text-xs text-slate-400">{c.nbPersonnes ?? "?"} pers · {formatDate(c.dateSouhaitee)}</p></div><span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{c.statut}</span></div>
            ))}
            {commandes.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune commande.</p>}
          </div>
        </Card>

        {/* Menus */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><BookOpen size={15} className="mb-0.5 mr-1 inline text-marine" />Menus ({menus.length})</h2>
            <GenericForm endpoint="/api/traiteur/menus" title="Nouveau menu" triggerLabel="Menu" triggerVariant="outline" fields={[
              { name: "nom", label: "Nom du menu", required: true }, { name: "prixParPersonne", label: "Prix / personne (CDF)", type: "number" }, { name: "description", label: "Description", type: "textarea" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {menus.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{m.nom}</p><p className="text-xs text-slate-400 line-clamp-1">{m.description ?? "—"}</p></div><span className="font-display text-sm font-bold text-marine">{formatMontant(toNum(m.prixParPersonne), "CDF")}</span></div>
            ))}
            {menus.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun menu.</p>}
          </div>
        </Card>
      </div>

      {/* Stock alimentaire */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><Package size={15} className="mb-0.5 mr-1 inline text-marine" />Stock alimentaire · Valeur {formatMontant(stock.valeurTotale, "CDF")} {stock.alertes > 0 && <span className="ml-1 rounded-full bg-danger px-2 py-0.5 text-[11px] text-white">{stock.alertes} alerte(s)</span>}</h2>
          <div className="flex gap-2">
            <GenericForm endpoint="/api/traiteur/purchases" title="Achat d'ingrédient" description="Augmente le stock et recalcule le CMUP." triggerLabel="Achat" triggerVariant="outline" fields={[
              { name: "ingredientId", label: "Ingrédient", type: "select", required: true, options: ingredientOptions },
              { name: "quantite", label: "Quantité", type: "number" }, { name: "prixAchat", label: "Prix unitaire (CDF)", type: "number" }, { name: "fournisseur", label: "Fournisseur" }, { name: "date", label: "Date", type: "date" },
            ]} />
            <GenericForm endpoint="/api/traiteur/ingredients" title="Nouvel ingrédient" triggerLabel="Ingrédient" fields={[
              { name: "nom", label: "Nom", required: true }, { name: "unite", label: "Unité" }, { name: "quantite", label: "Stock initial", type: "number" }, { name: "prixAchat", label: "Prix (CDF)", type: "number" }, { name: "seuilAlerte", label: "Seuil d'alerte", type: "number" },
            ]} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Ingrédient</th><th className="px-5 py-2.5 text-right font-semibold">Stock</th>
              <th className="px-5 py-2.5 text-right font-semibold">Prix (CMUP)</th><th className="px-5 py-2.5 text-right font-semibold">Valeur</th><th className="px-5 py-2.5 font-semibold">Statut</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {stock.items.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun ingrédient.</td></tr> : stock.items.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-900">{i.nom}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${i.alerte ? "text-danger" : "text-slate-700"}`}>{formatNombre(i.quantite)} {i.unite ?? ""}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{formatMontant(i.prixAchat, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{formatMontant(i.valeur, "CDF")}</td>
                  <td className="px-5 py-3">{i.alerte ? <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-0.5 text-xs font-semibold text-danger"><AlertTriangle size={11} /> Stock bas</span> : <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">OK</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
