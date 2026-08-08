import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vehicleRental } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const description = String(body.description ?? "").trim();
    if (!description) return NextResponse.json({ error: "Description requise." }, { status: 400 });
    const [item] = await db.insert(vehicleRental).values({
      description,
      proprietaire: body.proprietaire ?? null,
      coutLocation: String(body.coutLocation ?? 0),
      dateDebut: body.dateDebut ?? null,
      dateFin: body.dateFin ?? null,
      statut: body.statut ?? "en_cours",
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
