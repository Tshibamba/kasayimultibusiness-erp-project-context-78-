import Link from "next/link";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { Users, Wallet, Percent, BadgeCheck, Search } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { calculerIPR, CNSS_PATRONALE, CNSS_SALARIALE } from "@/lib/fiscal";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RhPage() {
  const items = await db.select().from(employees).where(eq(employees.statut, "ACTIF")).orderBy(asc(employees.nom));
  const masse = items.reduce((s, e) => s + toNum(e.salaireBase), 0);
  const cnss = Math.round(masse * (CNSS_PATRONALE + CNSS_SALARIALE));
  const ipr = items.reduce((s, e) => s + calculerIPR(toNum(e.salaireBase)), 0);
  const depts = new Set(items.map((e) => e.departement).filter(Boolean));

  const stats = [
    { label: "Effectif actif", value: formatNombre(items.length, 0), icon: Users, tint: "bg-marine/10 text-marine" },
    { label: "Masse salariale / mois", value: formatMontant(masse, "CDF"), icon: Wallet, tint: "bg-ciel/10 text-ciel" },
    { label: "Charges CNSS (8,5%)", value: formatMontant(cnss, "CDF"), icon: Percent, tint: "bg-or/15 text-[#c08700]" },
    { label: "Départements", value: formatNombre(depts.size, 0), icon: BadgeCheck, tint: "bg-succes/10 text-succes" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Ressources humaines</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Gestion du personnel</h1>
        </div>
        <GenericForm endpoint="/api/rh/employees" title="Nouvel employé" description="Renseignez la fiche complète du personnel (matricule, grade, documents...)." triggerLabel="Nouvel employé" fields={[
          { name: "matricule", label: "Matricule", placeholder: "ex. KMB-001" },
          { name: "prenom", label: "Prénom", required: true },
          { name: "nom", label: "Nom", required: true },
          { name: "genre", label: "Genre", type: "select", options: [{ value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }] },
          { name: "telephone", label: "Téléphone" },
          { name: "email", label: "Email" },
          { name: "departement", label: "Département", placeholder: "Agriculture, Commerce..." },
          { name: "poste", label: "Fonction / Poste" },
          { name: "grade", label: "Grade" },
          { name: "salaireBase", label: "Salaire de base (CDF)", type: "number" },
          { name: "typeContrat", label: "Type de contrat", type: "select", options: [
            { value: "CDI", label: "CDI" }, { value: "CDD", label: "CDD" },
            { value: "JOURNALIER", label: "Journalier" }, { value: "PRESTATAIRE", label: "Prestataire" },
          ] },
          { name: "dateEmbauche", label: "Date d'embauche", type: "date" },
          { name: "cin", label: "N° Pièce d'identité" },
          { name: "photoUrl", label: "URL Photo" },
        ]} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-slate-500">{s.label}</p><p className="mt-2 font-display text-xl font-bold text-slate-900">{s.value}</p></div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.tint}`}><Icon size={20} /></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-slate-900">Liste du personnel ({items.length})</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400"><Search size={13} /> Cliquez sur un employé pour voir sa fiche complète</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Employé</th>
                <th className="px-5 py-3 font-semibold">Matricule</th>
                <th className="px-5 py-3 font-semibold">Département</th>
                <th className="px-5 py-3 font-semibold">Fonction</th>
                <th className="px-5 py-3 font-semibold">Grade</th>
                <th className="px-5 py-3 font-semibold">Contrat</th>
                <th className="px-5 py-3 text-right font-semibold">Salaire</th>
                <th className="px-5 py-3 font-semibold">Embauche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">Aucun employé.</td></tr>
              ) : items.map((e) => (
                <tr key={e.id} className="group transition hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Link href={`/rh/${e.id}`} className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-marine/10 text-xs font-bold text-marine">
                        {e.photoUrl ? <img src={e.photoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : `${e.prenom[0]}${e.nom[0]}`}
                      </div>
                      <span className="font-semibold text-slate-900 group-hover:text-marine">{e.prenom} {e.nom}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{e.matricule ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.departement ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.poste ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{e.grade ?? "—"}</td>
                  <td className="px-5 py-3.5"><span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium">{e.typeContrat}</span></td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">{formatMontant(toNum(e.salaireBase), "CDF")}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(e.dateEmbauche)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-center text-xs text-slate-400">
        💡 Chaque employé dispose d'une fiche complète : <strong>matricule, grade, documents (CV, diplômes, contrat, CIN), congés, présences, historique carrière et bulletins de paie PDF</strong>. Cliquez sur un employé pour y accéder.
      </p>
    </div>
  );
}
