import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cateringIngredient, cateringPurchase } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toNum, round } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ingredientId = Number(body.ingredientId);
    const qte = Number(body.quantite ?? 0);
    const pu = Number(body.prixAchat ?? 0);
    if (!ingredientId) return NextResponse.json({ error: "Ingrédient requis." }, { status: 400 });

    const [ing] = await db.select().from(cateringIngredient).where(eq(cateringIngredient.id, ingredientId));
    if (!ing) return NextResponse.json({ error: "Ingrédient introuvable." }, { status: 404 });

    // Mise à jour du stock + CMUP
    const oldQ = toNum(ing.quantite);
    const oldP = toNum(ing.prixAchat);
    const newQ = oldQ + qte;
    const newP = newQ > 0 ? (oldQ * oldP + qte * pu) / newQ : pu;
    await db.update(cateringIngredient)
      .set({ quantite: String(round(newQ, 2)), prixAchat: String(round(newP, 4)) })
      .where(eq(cateringIngredient.id, ingredientId));

    const [item] = await db.insert(cateringPurchase).values({
      ingredientId,
      quantite: String(qte),
      prixAchat: String(pu),
      fournisseur: body.fournisseur ?? null,
      date: body.date ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
