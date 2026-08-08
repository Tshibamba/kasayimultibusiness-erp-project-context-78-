import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { culture } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parcelleId = Number(body.parcelleId);
    const nom = String(body.nom ?? "").trim();
    if (!parcelleId || !nom) return NextResponse.json({ error: "Parcelle et nom requis." }, { status: 400 });
    const [item] = await db.insert(culture).values({
      parcelleId,
      nom,
      variete: body.variete ?? null,
      dateSemis: body.dateSemis ?? null,
      dateRecoltePrevue: body.dateRecoltePrevue ?? null,
      superficie: String(body.superficie ?? 0),
      mainOeuvre: String(body.mainOeuvre ?? 0),
      statut: body.statut ?? "en_cours",
      responsable: body.responsable ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
