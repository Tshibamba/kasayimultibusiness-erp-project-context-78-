import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(vehicles).orderBy(asc(vehicles.marque));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db
      .insert(vehicles)
      .values({
        plaque: body.plaque,
        marque: body.marque ?? null,
        modele: body.modele ?? null,
        type: body.type ?? null,
        capacite: body.capacite ?? null,
      statut: body.statut ?? "actif",
      dateAchat: body.dateAchat ?? null,
      annee: body.annee ? Number(body.annee) : null,
      coutAchat: String(body.coutAchat ?? 0),
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
