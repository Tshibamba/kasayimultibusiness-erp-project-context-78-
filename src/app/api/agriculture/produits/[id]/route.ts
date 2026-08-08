import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { produitIntrant } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [maj] = await db
      .update(produitIntrant)
      .set({
        nom: body.nom ?? undefined,
        categorie: body.categorie ?? undefined,
        unite: body.unite ?? undefined,
        description: body.description ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(produitIntrant.id, Number(id)))
      .returning();
    if (!maj) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }
    return NextResponse.json({ produit: maj });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(produitIntrant).where(eq(produitIntrant.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
