import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Receipt, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getEventDetail } from "@/lib/traiteur/analyse";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getEventDetail(Number(id));
  if (!d) notFound();
  const eid = Number(id);
  const positif = d.benefice >= 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/traiteur" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-marine"><ArrowLeft size={15} /> Service traiteur</Link>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-marine to-[#1d5a82] px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-wide text-ciel-clair">{d.event.typeEvenement ?? "Événement"} · {d.event.statut}</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{d.event.nomClient}</h1>
          <p className="mt-1 text-sm text-slate-200">{d.event.lieu ?? "—"} · {formatDate(d.event.dateEvenement)} · {d.event.nbInvites ?? "?"} invités</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 lg:grid-cols-4">
          <Kpi label="Revenu (montant)" value={formatMontant(d.revenu, "CDF")} />
          <Kpi label="Dépenses" value={formatMontant(d.dep, "CDF")} />
          <Kpi label="Personnel" value={formatMontant(d.pers, "CDF")} />
          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bénéfice</p>
            <p className={`mt-1 flex items-center gap-1 font-display text-lg font-bold ${positif ? "text-emerald-600" : "text-danger"}`}>{positif ? <TrendingUp size={16} /> : <TrendingDown size={16} />}{formatMontant(d.benefice, "CDF")}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personnel */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><Users size={15} className="mb-0.5 mr-1 inline text-marine" />Personnel ({d.staff.length})</h2>
            <GenericForm endpoint="/api/traiteur/staff" preset={{ eventId: eid }} title="Membre du personnel" triggerLabel="Ajouter" triggerVariant="outline" fields={[
              { name: "nom", label: "Nom", required: true }, { name: "role", label: "Rôle", placeholder: "Serveur, cuisinier..." }, { name: "cout", label: "Coût (CDF)", type: "number" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {d.staff.map((s) => (<div key={s.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{s.nom}</p><p className="text-xs text-slate-400">{s.role ?? "—"}</p></div><p className="font-display text-sm font-bold text-danger">{formatMontant(toNum(s.cout), "CDF")}</p></div>))}
            {d.staff.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun personnel.</p>}
          </div>
        </Card>

        {/* Dépenses */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><Receipt size={15} className="mb-0.5 mr-1 inline text-marine" />Dépenses ({d.depenses.length})</h2>
            <GenericForm endpoint="/api/traiteur/expenses" preset={{ eventId: eid }} title="Nouvelle dépense" triggerLabel="Ajouter" triggerVariant="outline" fields={[
              { name: "type", label: "Type", placeholder: "Décoration, transport..." }, { name: "description", label: "Description" }, { name: "montant", label: "Montant (CDF)", type: "number" }, { name: "date", label: "Date", type: "date" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {d.depenses.map((e) => (<div key={e.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{e.type ?? "Dépense"}</p><p className="text-xs text-slate-400">{e.description ?? formatDate(e.date)}</p></div><p className="font-display text-sm font-bold text-danger">{formatMontant(toNum(e.montant), "CDF")}</p></div>))}
            {d.depenses.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune dépense.</p>}
          </div>
        </Card>
      </div>

      {/* Factures */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><FileText size={15} className="mb-0.5 mr-1 inline text-marine" />Factures ({d.invoices.length})</h2>
          <GenericForm endpoint="/api/traiteur/invoices" preset={{ eventId: eid }} title="Nouvelle facture (TVA 16%)" triggerLabel="Facture" triggerVariant="outline" fields={[
            { name: "numero", label: "Numéro" }, { name: "montantHT", label: "Montant HT (CDF)", type: "number" }, { name: "date", label: "Date", type: "date" }, { name: "statut", label: "Statut", type: "select", options: [{ value: "emise", label: "Émise" }, { value: "payee", label: "Payée" }, { value: "impayee", label: "Impayée" }] },
          ]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400"><th className="px-5 py-2.5 font-semibold">Numéro</th><th className="px-5 py-2.5 text-right font-semibold">HT</th><th className="px-5 py-2.5 text-right font-semibold">TVA</th><th className="px-5 py-2.5 text-right font-semibold">TTC</th><th className="px-5 py-2.5 font-semibold">Statut</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {d.invoices.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucune facture.</td></tr> : d.invoices.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{i.numero ?? "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{formatMontant(toNum(i.montantHT), "CDF")}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{formatMontant(toNum(i.taxe), "CDF")}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{formatMontant(toNum(i.totalTTC), "CDF")}</td>
                  <td className="px-5 py-3"><span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{i.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (<div className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p></div>);
}
