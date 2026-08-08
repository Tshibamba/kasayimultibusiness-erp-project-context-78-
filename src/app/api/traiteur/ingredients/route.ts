import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cateringIngredient } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    if (!nom) return NextResponse.json({ error: "Nom de l'ingrédient requis." }, { status: 400 });
    const [item] = await db.insert(cateringIngredient).values({
      nom,
      unite: body.unite ?? null,
      quantite: String(body.quantite ?? 0),
      prixAchat: String(body.prixAchat ?? 0),
      seuilAlerte: String(body.seuilAlerte ?? 0),
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
