import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { parcelle } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    if (!nom) return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
    const [item] = await db.insert(parcelle).values({
      nom,
      localisation: body.localisation ?? null,
      surface: String(body.surface ?? 0),
      uniteSurface: body.uniteSurface ?? "ha",
      statut: body.statut ?? "active",
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
