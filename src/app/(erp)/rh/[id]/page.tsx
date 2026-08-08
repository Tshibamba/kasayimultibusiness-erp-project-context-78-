import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { employees, employeeDocument, employeeHistory, leaves, attendance, payroll } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ArrowLeft, FileText, Clock, CalendarOff, History, Wallet, UserCircle2 } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { DeleteButton } from "@/components/erp/row-actions";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eid = Number(id);
  const [employee] = await db.select().from(employees).where(eq(employees.id, eid));
  if (!employee) notFound();

  const [documents, historique, conges, presences, bulletins] = await Promise.all([
    db.select().from(employeeDocument).where(eq(employeeDocument.employeeId, eid)),
    db.select().from(employeeHistory).where(eq(employeeHistory.employeeId, eid)).orderBy(desc(employeeHistory.date)),
    db.select().from(leaves).where(eq(leaves.employeeId, eid)).orderBy(desc(leaves.dateDebut)),
    db.select().from(attendance).where(eq(attendance.employeeId, eid)).orderBy(desc(attendance.date)).limit(20),
    db.select().from(payroll).where(eq(payroll.employeeId, eid)).orderBy(desc(payroll.annee), desc(payroll.mois)),
  ]);

  const salaireBase = toNum(employee.salaireBase);
  const congesJours = conges.filter((c) => c.statut === "approved").reduce((s, c) => s + toNum(c.jours), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/rh" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-marine"><ArrowLeft size={15} /> RH</Link>
        <div className="flex gap-2">
          <a href={`/api/rh/employees/${eid}/payslip`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-or/15 px-4 py-2 text-sm font-bold text-[#c08700] transition hover:bg-or hover:text-white">📄 Bulletin</a>
          <DeleteButton endpoint={`/api/rh/employees/${eid}`} />
        </div>
      </div>

      {/* En-tête employé */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 bg-gradient-to-r from-marine to-[#1d5a82] px-6 py-6 text-white">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl font-bold">
            {employee.photoUrl ? <img src={employee.photoUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : `${employee.prenom[0]}${employee.nom[0]}`}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{employee.prenom} {employee.nom}</h1>
            <p className="text-sm text-ciel-clair">{employee.poste ?? "—"} · {employee.departement ?? "—"} · {employee.grade ?? "—"}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-200">
              {employee.matricule && <span>Matricule : <strong>{employee.matricule}</strong></span>}
              <span>Contrat : <strong>{employee.typeContrat}</strong></span>
              <span>Statut : <strong>{employee.statut}</strong></span>
              <span>Embauche : <strong>{formatDate(employee.dateEmbauche)}</strong></span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4">
          <Info label="Téléphone" value={employee.telephone ?? "—"} />
          <Info label="Email" value={employee.email ?? "—"} />
          <Info label="Salaire base" value={formatMontant(salaireBase, "CDF")} />
          <Info label="Congés pris" value={`${formatNombre(congesJours, 0)} jours`} />
        </div>
      </Card>

      {/* Documents */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><FileText size={15} className="mb-0.5 mr-1 inline text-marine" />Documents ({documents.length})</h2>
          <GenericForm endpoint="/api/rh/documents" preset={{ employeeId: eid }} title="Nouveau document" triggerLabel="Document" triggerVariant="outline" fields={[
            { name: "type", label: "Type", type: "select", options: [
              { value: "cv", label: "CV" }, { value: "diplome", label: "Diplôme" },
              { value: "contrat", label: "Contrat signé" }, { value: "cin", label: "Pièce d'identité" },
              { value: "photo", label: "Photo" }, { value: "autre", label: "Autre" },
            ] },
            { name: "nomFichier", label: "Nom du fichier" },
            { name: "url", label: "Lien / référence" },
          ]} />
        </div>
        <div className="divide-y divide-slate-50">
          {documents.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun document.</p> : documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3">
              <div><p className="text-sm font-semibold capitalize text-slate-800">{d.type}</p><p className="text-xs text-slate-400">{d.nomFichier ?? "—"} · {formatDate(d.dateAjout)}</p></div>
              {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-ciel hover:text-marine">Voir →</a>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Congés */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><CalendarOff size={15} className="mb-0.5 mr-1 inline text-marine" />Congés ({conges.length})</h2>
            <GenericForm endpoint="/api/rh/leaves" preset={{ employeeId: eid }} title="Demande de congé" triggerLabel="Congé" triggerVariant="outline" fields={[
              { name: "type", label: "Type", type: "select", options: [
                { value: "Congé annuel", label: "Congé annuel" }, { value: "Maladie", label: "Maladie" },
                { value: "Maternité", label: "Maternité" }, { value: "Sans solde", label: "Sans solde" },
              ] },
              { name: "dateDebut", label: "Début", type: "date" }, { name: "dateFin", label: "Fin", type: "date" }, { name: "jours", label: "Jours", type: "number" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {conges.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun congé.</p> : conges.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-2.5">
                <div><p className="text-sm font-semibold text-slate-800">{c.type}</p><p className="text-xs text-slate-400">{formatDate(c.dateDebut)} → {formatDate(c.dateFin)} · {formatNombre(toNum(c.jours), 0)} j</p></div>
                <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${c.statut === "approved" ? "bg-emerald-50 text-emerald-700" : c.statut === "rejected" ? "bg-red-50 text-danger" : "bg-amber-50 text-amber-700"}`}>{c.statut === "approved" ? "Approuvé" : c.statut === "rejected" ? "Refusé" : "En attente"}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Présences */}
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5"><h2 className="font-display text-sm font-bold text-slate-900"><Clock size={15} className="mb-0.5 mr-1 inline text-marine" />Présences ({presences.length})</h2></div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {presences.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune présence.</p> : presences.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
                <div><p className="text-sm font-medium text-slate-700">{formatDate(p.date)}</p><p className="text-xs text-slate-400">{p.checkIn ?? "—"} → {p.checkOut ?? "—"}</p></div>
                <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold capitalize ${p.statut === "present" ? "bg-emerald-50 text-emerald-700" : p.statut === "absent" ? "bg-red-50 text-danger" : "bg-amber-50 text-amber-700"}`}>{p.statut}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Historique */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><History size={15} className="mb-0.5 mr-1 inline text-marine" />Historique carrière ({historique.length})</h2>
          <GenericForm endpoint="/api/rh/history" preset={{ employeeId: eid }} title="Événement carrière" triggerLabel="Ajouter" triggerVariant="outline" fields={[
            { name: "type", label: "Type", type: "select", options: [
              { value: "affectation", label: "Affectation" }, { value: "promotion", label: "Promotion" },
              { value: "sanction", label: "Sanction" }, { value: "formation", label: "Formation" },
            ] },
            { name: "description", label: "Description", required: true },
            { name: "date", label: "Date", type: "date" }, { name: "details", label: "Détails" },
          ]} />
        </div>
        <div className="relative space-y-0 divide-y divide-slate-50">
          {historique.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun historique.</p> : historique.map((h) => (
            <div key={h.id} className="flex gap-4 px-5 py-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-marine/10 text-xs">{h.type === "promotion" ? "📈" : h.type === "sanction" ? "⚠️" : h.type === "formation" ? "🎓" : "📌"}</div>
              <div><p className="text-sm font-semibold text-slate-800 capitalize">{h.type} — {formatDate(h.date)}</p><p className="text-sm text-slate-600">{h.description}</p>{h.details && <p className="text-xs text-slate-400">{h.details}</p>}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bulletins de paie */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5"><h2 className="font-display text-sm font-bold text-slate-900"><Wallet size={15} className="mb-0.5 mr-1 inline text-marine" />Bulletins de paie ({bulletins.length})</h2></div>
        <div className="divide-y divide-slate-50">
          {bulletins.length === 0 ? <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun bulletin.</p> : bulletins.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-3">
              <div><p className="text-sm font-semibold text-slate-800">{b.mois}/{b.annee}</p><p className="text-xs text-slate-400">Net : {formatMontant(toNum(b.salaireNet), "CDF")} · {b.statut}</p></div>
              <a href={`/api/rh/employees/${eid}/payslip`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-ciel hover:text-marine">📄 PDF</a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}
