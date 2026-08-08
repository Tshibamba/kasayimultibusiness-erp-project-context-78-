import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { fournisseur } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db
    .select()
    .from(fournisseur)
    .orderBy(asc(fournisseur.nom));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    if (!nom) {
      return NextResponse.json(
        { error: "Le nom du fournisseur est obligatoire." },
        { status: 400 }
      );
    }
    const [item] = await db
      .insert(fournisseur)
      .values({
        nom,
        telephone: body.telephone ?? null,
        email: body.email ?? null,
        adresse: body.adresse ?? null,
        contact: body.contact ?? null,
        typeSemence: body.typeSemence ?? null,
        conditionsPaiement: body.conditionsPaiement ?? null,
      })
      .returning();
    return NextResponse.json({ fournisseur: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
