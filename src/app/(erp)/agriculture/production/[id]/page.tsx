import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, Wheat, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { produitIntrant } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getCultureDetail } from "@/lib/agriculture/production";
import { formatMontant, formatNombre, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CultureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCultureDetail(Number(id));
  if (!d) notFound();

  const intrants = await db
    .select({ id: produitIntrant.id, nom: produitIntrant.nom, unite: produitIntrant.unite })
    .from(produitIntrant)
    .orderBy(asc(produitIntrant.nom));
  const intrantOptions = intrants.map((i) => ({ value: String(i.id), label: `${i.nom} (${i.unite})` }));

  const margePositive = d.marge >= 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/agriculture/production" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-marine">
        <ArrowLeft size={15} /> Production
      </Link>

      {/* En-tête + rentabilité */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-marine to-[#1d5a82] px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-wide text-ciel-clair">{d.culture.parcelleNom ?? "Parcelle"} · {d.culture.statut}</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{d.culture.nom}</h1>
          <p className="mt-1 text-sm text-slate-200">
            {d.culture.variete ? `${d.culture.variete} · ` : ""}Semis {formatDate(d.culture.dateSemis)} → Récolte prévue {formatDate(d.culture.dateRecoltePrevue)}
          </p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 lg:grid-cols-5">
          <Kpi label="Coût intrants" value={formatMontant(d.coutIntrants, "CDF")} />
          <Kpi label="Main d'œuvre" value={formatMontant(d.mainOeuvre, "CDF")} />
          <Kpi label="Coût total" value={formatMontant(d.coutTotal, "CDF")} />
          <Kpi label="Revenu ventes" value={formatMontant(d.revenu, "CDF")} />
          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Marge nette</p>
            <p className={`mt-1 flex items-center gap-1 font-display text-lg font-bold ${margePositive ? "text-emerald-600" : "text-danger"}`}>
              {margePositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {formatMontant(d.marge, "CDF")}
            </p>
          </div>
        </div>
      </Card>

      {/* Traitements — liés au stock intrant */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><FlaskConical size={15} className="mb-0.5 mr-1 inline text-marine" />Traitements ({d.traitements.length})</h2>
          <GenericForm
            endpoint="/api/agriculture/traitements"
            preset={{ cultureId: Number(id) }}
            title="Nouveau traitement"
            description="Si vous choisissez un intrant, son stock sera décrémenté et les alertes mises à jour."
            triggerLabel="Traitement"
            fields={[
              { name: "type", label: "Type", type: "select", options: [
                { value: "Fertilisation", label: "Fertilisation" }, { value: "Désherbage", label: "Désherbage" },
                { value: "Traitement phytosanitaire", label: "Phytosanitaire" }, { value: "Semis / Semence", label: "Semis / Semence" }, { value: "Autre", label: "Autre" },
              ] },
              { name: "produit", label: "Produit" },
              { name: "quantite", label: "Quantité", type: "number" },
              { name: "unite", label: "Unité", placeholder: "kg, L, sac..." },
              { name: "cout", label: "Coût (CDF)", type: "number" },
              { name: "date", label: "Date", type: "date" },
              { name: "intrantProduitId", label: "Décrémenter un intrant en stock", type: "select", options: intrantOptions },
            ]}
          />
        </div>
        <ListeSimple rows={d.traitements.map((t) => ({ gauche: `${t.type ?? "Traitement"} — ${t.produit ?? "—"}`, droite: formatMontant(Number(t.cout), "CDF"), sub: `${formatNombre(Number(t.quantite))} ${t.unite ?? ""} · ${formatDate(t.date)}` }))} vide="Aucun traitement." />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Récoltes */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><Wheat size={15} className="mb-0.5 mr-1 inline text-marine" />Récoltes ({d.recoltes.length})</h2>
            <GenericForm
              endpoint="/api/agriculture/recoltes"
              preset={{ cultureId: Number(id) }}
              title="Nouvelle récolte"
              triggerLabel="Récolte"
              fields={[
                { name: "quantite", label: "Quantité", type: "number", required: true },
                { name: "unite", label: "Unité", placeholder: "sac, kg, tonne..." },
                { name: "qualite", label: "Qualité" },
                { name: "pertes", label: "Pertes (quantité)", type: "number" },
                { name: "date", label: "Date", type: "date" },
              ]}
            />
          </div>
          <ListeSimple rows={d.recoltes.map((r) => ({ gauche: `Récolte — ${r.qualite ?? "—"}`, droite: `${formatNombre(Number(r.quantite))} ${r.unite ?? ""}`, sub: formatDate(r.date) }))} vide="Aucune récolte." />
        </Card>

        {/* Ventes */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><ShoppingCart size={15} className="mb-0.5 mr-1 inline text-marine" />Ventes ({d.ventes.length})</h2>
            <GenericForm
              endpoint="/api/agriculture/ventes"
              preset={{ cultureId: Number(id) }}
              title="Nouvelle vente"
              triggerLabel="Vente"
              fields={[
                { name: "produit", label: "Produit vendu" },
                { name: "client", label: "Client" },
                { name: "quantite", label: "Quantité", type: "number" },
                { name: "unite", label: "Unité" },
                { name: "prixUnitaire", label: "Prix unitaire (CDF)", type: "number" },
                { name: "date", label: "Date", type: "date" },
              ]}
            />
          </div>
          <ListeSimple rows={d.ventes.map((v) => ({ gauche: `${v.produit ?? "Vente"} — ${v.client ?? "—"}`, droite: formatMontant(Number(v.total), "CDF"), sub: `${formatNombre(Number(v.quantite))} ${v.unite ?? ""} @ ${formatMontant(Number(v.prixUnitaire), "CDF")}` }))} vide="Aucune vente." />
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ListeSimple({ rows, vide }: { rows: { gauche: string; droite: string; sub?: string }[]; vide: string }) {
  if (rows.length === 0) return <p className="px-5 py-8 text-center text-sm text-slate-400">{vide}</p>;
  return (
    <div className="divide-y divide-slate-50">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-3 px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{r.gauche}</p>
            {r.sub && <p className="text-xs text-slate-400">{r.sub}</p>}
          </div>
          <p className="font-display text-sm font-bold text-slate-900">{r.droite}</p>
        </div>
      ))}
    </div>
  );
}
