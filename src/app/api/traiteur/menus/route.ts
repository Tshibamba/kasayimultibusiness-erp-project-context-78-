import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menu } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    if (!nom) return NextResponse.json({ error: "Nom du menu requis." }, { status: 400 });
    const [item] = await db.insert(menu).values({
      nom,
      description: body.description ?? null,
      prixParPersonne: String(body.prixParPersonne ?? 0),
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
