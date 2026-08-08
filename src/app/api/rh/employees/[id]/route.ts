import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees, employeeDocument, employeeHistory } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eid = Number(id);
  const [employee] = await db.select().from(employees).where(eq(employees.id, eid));
  if (!employee) return NextResponse.json({ error: "Employé introuvable." }, { status: 404 });
  const [documents, historique] = await Promise.all([
    db.select().from(employeeDocument).where(eq(employeeDocument.employeeId, eid)),
    db.select().from(employeeHistory).where(eq(employeeHistory.employeeId, eid)).orderBy(asc(employeeHistory.date)),
  ]);
  return NextResponse.json({ employee, documents, historique });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const valeurs: Record<string, unknown> = {};
    const champs = ["matricule","prenom","nom","genre","telephone","email","adresse","cin","photoUrl","dateNaissance","lieuNaissance","situationFamiliale","nbEnfants","dateEmbauche","departement","poste","grade","salaireBase","statut"];
    for (const c of champs) {
      if (body[c] !== undefined) {
        if (c === "nbEnfants") valeurs.nbEnfants = Number(body.nbEnfants);
        else if (c === "salaireBase") valeurs.salaireBase = String(body.salaireBase);
        else valeurs[c] = body[c];
      }
    }
    if (body.typeContrat) valeurs.typeContrat = body.typeContrat;
    if (Object.keys(valeurs).length === 0) return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
    await db.update(employees).set(valeurs).where(eq(employees.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(employees).where(eq(employees.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
