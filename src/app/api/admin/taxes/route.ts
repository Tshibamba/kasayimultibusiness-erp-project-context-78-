import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { taxPayment } from "@/db/schema";
import { desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(taxPayment).orderBy(desc(taxPayment.echeance));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = String(body.type ?? "").trim();
    if (!type) return NextResponse.json({ error: "Type d'impôt requis." }, { status: 400 });
    const [item] = await db.insert(taxPayment).values({
      type,
      periode: body.periode ?? null,
      montant: String(body.montant ?? 0),
      datePaiement: body.datePaiement ?? null,
      echeance: body.echeance ?? null,
      reference: body.reference ?? null,
      statut: body.statut ?? "a_payer",
      notes: body.notes ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

void asc;
