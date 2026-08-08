import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commerceProducts } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(commerceProducts).orderBy(asc(commerceProducts.nom));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db
      .insert(commerceProducts)
      .values({
        nom: body.nom,
        categorie: body.categorie ?? null,
        unite: body.unite ?? "pièce",
        prixAchat: String(body.prixAchat ?? 0),
        prixVente: String(body.prixVente ?? 0),
        stockMin: String(body.stockMin ?? 0),
        stock: String(body.stock ?? 0),
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
