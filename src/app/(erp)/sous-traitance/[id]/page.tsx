import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Users, Package, Receipt, Banknote, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getProjetDetail } from "@/lib/soustraitance/analyse";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getProjetDetail(Number(id));
  if (!d) notFound();
  const pid = Number(id);
  const positif = d.benefice >= 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/sous-traitance" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-marine"><ArrowLeft size={15} /> Sous-traitance</Link>
        <a href={`/api/sous-traitance/${id}/pdf`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-marine px-4 py-2 text-sm font-bold text-white transition hover:bg-marine-clair">📄 Rapport PDF</a>
      </div>

      {/* En-tête + rentabilité */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-marine to-[#1d5a82] px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-wide text-ciel-clair">{d.projet.type ?? "Travaux"} · {d.projet.statut}</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{d.projet.nom}</h1>
          <p className="mt-1 text-sm text-slate-200">{d.projet.client ?? "—"} · {d.projet.localisation ?? "—"}</p>
          <div className="mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-or" style={{ width: `${Math.min(100, toNum(d.projet.avancement))}%` }} /></div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 lg:grid-cols-4">
          <Kpi label="Budget" value={formatMontant(d.budget, "CDF")} />
          <Kpi label="Contrat" value={formatMontant(d.montantContrat || d.budget, "CDF")} />
          <Kpi label="Coûts réels" value={formatMontant(d.couts, "CDF")} />
          <Kpi label="Bénéfice prévu (26.12)" value={formatMontant(d.beneficePrevu, "CDF")} />
          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bénéfice réel</p>
            <p className={`mt-1 flex items-center gap-1 font-display text-lg font-bold ${positif ? "text-emerald-600" : "text-danger"}`}>{positif ? <TrendingUp size={16} /> : <TrendingDown size={16} />}{formatMontant(d.benefice, "CDF")}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Encaissé {formatMontant(d.encaisse, "CDF")} − Coûts {formatMontant(d.couts, "CDF")}</p>
          </div>
        </div>
      </Card>

      {/* Alertes 26.14 */}
      {d.budget > 0 && d.couts > d.budget && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-display text-sm font-bold text-red-800">DÉPASSEMENT BUDGÉTAIRE (RG17 / 26.14)</p>
            <p className="text-xs text-red-600">Dépenses {formatMontant(d.couts, "CDF")} &gt; Budget {formatMontant(d.budget, "CDF")} — Dépassement : {formatMontant(d.couts - d.budget, "CDF")}</p>
          </div>
        </div>
      )}

      {/* 26.10 : Suivi d'avancement temporel */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900">📈 Suivi d'avancement ({d.progress?.length ?? 0})</h2>
          <GenericForm endpoint="/api/sous-traitance/progress" preset={{ projectId: Number(id) }} title="Mise à jour avancement" triggerLabel="Avancement" triggerVariant="outline" fields={[
            { name: "avancement", label: "Avancement (%)", type: "number", required: true },
            { name: "date", label: "Date", type: "date" },
            { name: "note", label: "Note", type: "textarea" },
          ]} />
        </div>
        {d.progress && d.progress.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {d.progress.map((pr) => (
              <div key={pr.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-medium text-slate-400 w-24">{formatDate(pr.date)}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-ciel" style={{ width: `${Math.min(100, toNum(pr.avancement))}%` }} />
                  </div>
                </div>
                <span className="font-display text-sm font-bold text-marine w-12 text-right">{formatNombre(toNum(pr.avancement), 0)}%</span>
                {pr.note && <span className="text-xs text-slate-400 hidden lg:block">{pr.note}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun suivi d'avancement enregistré.</p>
        )}
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contrats */}
        <Section icon={FileText} titre={`Contrats (${d.contrats.length})`} endpoint="/api/sous-traitance/contrats" pid={pid} formTitle="Nouveau contrat" fields={[
          { name: "reference", label: "Référence" }, { name: "objet", label: "Objet" }, { name: "montant", label: "Montant (CDF)", type: "number" }, { name: "dateSignature", label: "Signature", type: "date" }, { name: "statut", label: "Statut", type: "select", options: [{ value: "signe", label: "Signé" }, { value: "en_cours", label: "En cours" }, { value: "termine", label: "Terminé" }] },
        ]} rows={d.contrats.map((c) => ({ g: `${c.reference ?? "Contrat"} — ${c.objet ?? ""}`, d: formatMontant(toNum(c.montant), "CDF"), s: formatDate(c.dateSignature) }))} vide="Aucun contrat." />

        {/* Équipes */}
        <Section icon={Users} titre={`Équipes (${d.teams.length})`} endpoint="/api/sous-traitance/teams" pid={pid} formTitle="Membre d'équipe" fields={[
          { name: "nom", label: "Nom", required: true }, { name: "role", label: "Rôle / fonction" }, { name: "coutMainOeuvre", label: "Coût main d'œuvre (CDF)", type: "number" },
        ]} rows={d.teams.map((t) => ({ g: `${t.nom} — ${t.role ?? ""}`, d: formatMontant(toNum(t.coutMainOeuvre), "CDF") }))} vide="Aucune équipe." />

        {/* Matériaux */}
        <Section icon={Package} titre={`Matériaux (${d.materials.length})`} endpoint="/api/sous-traitance/materials" pid={pid} formTitle="Achat matériau" fields={[
          { name: "designation", label: "Désignation", required: true }, { name: "quantite", label: "Quantité", type: "number" }, { name: "unite", label: "Unité" }, { name: "coutUnitaire", label: "Coût unitaire (CDF)", type: "number" }, { name: "fournisseur", label: "Fournisseur" }, { name: "date", label: "Date", type: "date" },
        ]} rows={d.materials.map((m) => ({ g: `${m.designation} — ${m.fournisseur ?? "—"}`, d: formatMontant(toNum(m.quantite) * toNum(m.coutUnitaire), "CDF"), s: `${formatNombre(toNum(m.quantite))} ${m.unite ?? ""}` }))} vide="Aucun matériau." />

        {/* Dépenses */}
        <Section icon={Receipt} titre={`Dépenses (${d.expenses.length})`} endpoint="/api/sous-traitance/expenses" pid={pid} formTitle="Nouvelle dépense" fields={[
          { name: "type", label: "Type", placeholder: "Transport, location engin..." }, { name: "description", label: "Description" }, { name: "montant", label: "Montant (CDF)", type: "number" }, { name: "date", label: "Date", type: "date" },
        ]} rows={d.expenses.map((e) => ({ g: `${e.type ?? "Dépense"} — ${e.description ?? ""}`, d: formatMontant(toNum(e.montant), "CDF"), s: formatDate(e.date) }))} vide="Aucune dépense." />

        {/* Factures */}
        <Section icon={FileText} titre={`Factures (${d.invoices.length})`} endpoint="/api/sous-traitance/invoices" pid={pid} formTitle="Nouvelle facture (TVA 16%)" fields={[
          { name: "numero", label: "Numéro" }, { name: "montantHT", label: "Montant HT (CDF)", type: "number" }, { name: "date", label: "Date", type: "date" }, { name: "echeance", label: "Échéance", type: "date" }, { name: "statut", label: "Statut", type: "select", options: [{ value: "emise", label: "Émise" }, { value: "payee", label: "Payée" }, { value: "impayee", label: "Impayée" }] },
        ]} rows={d.invoices.map((i) => ({ g: `${i.numero ?? "Facture"} — ${i.statut}`, d: formatMontant(toNum(i.totalTTC), "CDF"), s: `HT ${formatMontant(toNum(i.montantHT), "CDF")} · TVA ${formatMontant(toNum(i.taxe), "CDF")}` }))} vide="Aucune facture." />

        {/* Paiements */}
        <Section icon={Banknote} titre={`Paiements (${d.payments.length})`} endpoint="/api/sous-traitance/payments" pid={pid} formTitle="Nouveau paiement" fields={[
          { name: "montant", label: "Montant (CDF)", type: "number" }, { name: "methode", label: "Méthode", placeholder: "Virement, espèces..." }, { name: "reference", label: "Référence" }, { name: "date", label: "Date", type: "date" },
        ]} rows={d.payments.map((p) => ({ g: `${p.methode ?? "Paiement"} — ${p.reference ?? ""}`, d: formatMontant(toNum(p.montant), "CDF"), s: formatDate(p.date) }))} vide="Aucun paiement." />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (<div className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p></div>);
}

function Section({ icon: Icon, titre, endpoint, pid, formTitle, fields, rows, vide }: {
  icon: typeof FileText; titre: string; endpoint: string; pid: number; formTitle: string;
  fields: { name: string; label: string; type?: "text" | "number" | "date" | "select"; options?: { value: string; label: string }[]; required?: boolean; placeholder?: string }[];
  rows: { g: string; d: string; s?: string }[]; vide: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
        <h2 className="font-display text-sm font-bold text-slate-900"><Icon size={15} className="mb-0.5 mr-1 inline text-marine" />{titre}</h2>
        <GenericForm endpoint={endpoint} preset={{ projectId: pid }} title={formTitle} triggerLabel="Ajouter" triggerVariant="outline" fields={fields} />
      </div>
      {rows.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">{vide}</p> : (
        <div className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-5 py-3">
              <div><p className="text-sm font-semibold text-slate-800">{r.g}</p>{r.s && <p className="text-xs text-slate-400">{r.s}</p>}</div>
              <p className="font-display text-sm font-bold text-slate-900">{r.d}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
