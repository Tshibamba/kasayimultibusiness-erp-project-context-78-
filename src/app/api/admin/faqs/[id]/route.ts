import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const valeurs: Record<string, unknown> = {};
    if (body.ordre != null) valeurs.ordre = Number(body.ordre);
    if (body.categorie) valeurs.categorie = body.categorie;
    if (Object.keys(valeurs).length === 0)
      return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
    await db.update(faqs).set(valeurs).where(eq(faqs.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(faqs).where(eq(faqs.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
