import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, subContract, projectTeam, projectMaterial, projectExpense, projectInvoice, projectPayment } from "@/db/schema";
import { sql } from "drizzle-orm";
import { calculerTVA, calculerTTC } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

async function isEmpty(t: string): Promise<boolean> {
  const r = await db.execute(sql`SELECT 1 FROM ${sql.identifier(t)} LIMIT 1`);
  return (r.rows?.length ?? 0) === 0;
}

export async function GET() {
  return POST();
}

export async function POST() {
  if (!(await isEmpty("sub_contract"))) {
    return NextResponse.json({ alreadySeeded: true });
  }
  const projets = await db.select().from(projects);
  if (projets.length === 0) return NextResponse.json({ error: "Aucun projet." }, { status: 400 });
  const [p1, p2] = projets;

  // Projet 1
  await db.insert(subContract).values({ projectId: p1.id, reference: `CTR-${p1.id}-001`, objet: p1.nom, montant: String(25000000), dateSignature: "2025-01-10", statut: "signe" });
  await db.insert(projectTeam).values({ projectId: p1.id, nom: "Équipe gros œuvre", role: "Chef de chantier", coutMainOeuvre: "3000000" });
  await db.insert(projectMaterial).values([
    { projectId: p1.id, designation: "Ciment 42.5", quantite: "100", unite: "sac", coutUnitaire: "28000", fournisseur: "Bâtiment Plus", date: "2025-01-20" },
    { projectId: p1.id, designation: "Fer à béton", quantite: "50", unite: "barre", coutUnitaire: "15000", fournisseur: "Bâtiment Plus", date: "2025-01-22" },
  ]);
  await db.insert(projectExpense).values({ projectId: p1.id, type: "Location engin", description: "Pelleteuse 1 semaine", montant: "1500000", date: "2025-02-01" });
  const ht1 = 15000000;
  await db.insert(projectInvoice).values({ projectId: p1.id, numero: `FAC-STR-0001`, montantHT: String(ht1), taxe: String(calculerTVA(ht1)), totalTTC: String(calculerTTC(ht1)), date: "2025-03-01", statut: "partielle" });
  await db.insert(projectPayment).values({ projectId: p1.id, montant: "10000000", date: "2025-03-15", methode: "Virement", reference: "VIR-001" });

  // Projet 2
  if (p2) {
    await db.insert(subContract).values({ projectId: p2.id, reference: `CTR-${p2.id}-001`, objet: p2.nom, montant: String(8000000), dateSignature: "2024-09-01", statut: "termine" });
    await db.insert(projectTeam).values({ projectId: p2.id, nom: "Équipe maçonnerie", role: "Contremaître", coutMainOeuvre: "1200000" });
    await db.insert(projectMaterial).values([
      { projectId: p2.id, designation: "Fer à béton", quantite: "30", unite: "barre", coutUnitaire: "15000", fournisseur: "Bâtiment Plus", date: "2024-09-10" },
      { projectId: p2.id, designation: "Ciment 42.5", quantite: "40", unite: "sac", coutUnitaire: "28000", fournisseur: "Bâtiment Plus", date: "2024-09-12" },
    ]);
    await db.insert(projectExpense).values({ projectId: p2.id, type: "Transport matériaux", montant: "400000", date: "2024-09-20" });
    const ht2 = 8000000;
    await db.insert(projectInvoice).values({ projectId: p2.id, numero: `FAC-STR-0002`, montantHT: String(ht2), taxe: String(calculerTVA(ht2)), totalTTC: String(calculerTTC(ht2)), date: "2024-11-15", statut: "payee" });
    await db.insert(projectPayment).values({ projectId: p2.id, montant: String(calculerTTC(ht2)), date: "2024-11-30", methode: "Espèces", reference: "REC-002" });
  }

  return NextResponse.json({ ok: true });
}
