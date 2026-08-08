import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { depense } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(depense).orderBy(desc(depense.date));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nature = String(body.nature ?? "").trim();
    if (!nature) return NextResponse.json({ error: "Nature de la dépense requise." }, { status: 400 });
    const [item] = await db.insert(depense).values({
      nature,
      montant: String(body.montant ?? 0),
      date: body.date ?? null,
      activite: body.activite ?? "general",
      categorie: body.categorie ?? null,
      responsable: body.responsable ?? null,
      modePaiement: body.modePaiement ?? null,
      justificatif: body.justificatif ?? null,
      notes: body.notes ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
