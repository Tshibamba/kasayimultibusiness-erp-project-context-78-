import { db } from "@/db";
import {
  projects, subContract, projectTeam, projectMaterial, projectExpense, projectInvoice, projectPayment, projectProgress,
} from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { toNum } from "@/lib/format";

export type ProjetSynthese = {
  id: number;
  nom: string;
  type: string | null;
  client: string | null;
  localisation: string | null;
  avancement: number;
  statut: string;
  budget: number;
  couts: number;
  facture: number;
  encaisse: number;
  benefice: number;
  beneficePrevu: number;
  montantContrat: number;
  budgetConsomme: number;
};

function analyser(
  projectId: number,
  budget: string | number,
  materials: { quantite: string | number; coutUnitaire: string | number }[],
  expenses: { montant: string | number }[],
  teams: { coutMainOeuvre: string | number }[],
  invoices: { totalTTC: string | number }[],
  payments: { montant: string | number }[],
) {
  const coutMateriaux = materials.reduce((s, m) => s + toNum(m.quantite) * toNum(m.coutUnitaire), 0);
  const coutDepenses = expenses.reduce((s, e) => s + toNum(e.montant), 0);
  const coutMainOeuvre = teams.reduce((s, t) => s + toNum(t.coutMainOeuvre), 0);
  const couts = coutMateriaux + coutDepenses + coutMainOeuvre;
  const facture = invoices.reduce((s, i) => s + toNum(i.totalTTC), 0);
  const encaisse = payments.reduce((s, p) => s + toNum(p.montant), 0);
  return { budget: toNum(budget), coutMateriaux, coutDepenses, coutMainOeuvre, couts, facture, encaisse, benefice: encaisse - couts };
}

export async function getProjetsSynthese(): Promise<ProjetSynthese[]> {
  const [projets, materials, expenses, teams, invoices, payments, contrats] = await Promise.all([
    db.select().from(projects).orderBy(desc(projects.createdAt)),
    db.select().from(projectMaterial),
    db.select().from(projectExpense),
    db.select().from(projectTeam),
    db.select().from(projectInvoice),
    db.select().from(projectPayment),
    db.select().from(subContract),
  ]);

  return projets.map((p) => {
    const a = analyser(
      p.id, p.budget,
      materials.filter((m) => m.projectId === p.id),
      expenses.filter((e) => e.projectId === p.id),
      teams.filter((t) => t.projectId === p.id),
      invoices.filter((i) => i.projectId === p.id),
      payments.filter((pay) => pay.projectId === p.id),
    );
    const montantContrat = contrats
      .filter((c) => c.projectId === p.id)
      .reduce((s, c) => s + toNum(c.montant), 0);
    const beneficePrevu = montantContrat > 0 ? montantContrat - a.couts : a.budget - a.couts;
    const budgetConsomme = a.budget > 0 ? Math.round((a.couts / a.budget) * 100) : 0;
    return {
      id: p.id, nom: p.nom, type: p.type, client: p.client, localisation: p.localisation,
      avancement: toNum(p.avancement), statut: p.statut, budget: a.budget,
      couts: a.couts, facture: a.facture, encaisse: a.encaisse, benefice: a.benefice,
      beneficePrevu, montantContrat, budgetConsomme,
    };
  });
}

export async function getProjetDetail(id: number) {
  const rows = await db.select().from(projects).where(eq(projects.id, id));
  const p = rows[0];
  if (!p) return null;

  const [contrats, teams, materials, expenses, invoices, payments, progress] = await Promise.all([
    db.select().from(subContract).where(eq(subContract.projectId, id)).orderBy(desc(subContract.dateSignature)),
    db.select().from(projectTeam).where(eq(projectTeam.projectId, id)),
    db.select().from(projectMaterial).where(eq(projectMaterial.projectId, id)).orderBy(desc(projectMaterial.date)),
    db.select().from(projectExpense).where(eq(projectExpense.projectId, id)).orderBy(desc(projectExpense.date)),
    db.select().from(projectInvoice).where(eq(projectInvoice.projectId, id)).orderBy(desc(projectInvoice.date)),
    db.select().from(projectPayment).where(eq(projectPayment.projectId, id)).orderBy(desc(projectPayment.date)),
    db.select().from(projectProgress).where(eq(projectProgress.projectId, id)).orderBy(asc(projectProgress.date)),
  ]);

  const a = analyser(id, p.budget, materials, expenses, teams, invoices, payments);
  const montantContrat = contrats.reduce((s, c) => s + toNum(c.montant), 0);
  const beneficePrevu = montantContrat > 0 ? montantContrat - a.couts : a.budget - a.couts;

  return { projet: p, contrats, teams, materials, expenses, invoices, payments, progress, montantContrat, beneficePrevu, ...a };
}
