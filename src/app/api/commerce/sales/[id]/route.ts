import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.statut) return NextResponse.json({ error: "Statut requis." }, { status: 400 });
    await db.update(sales).set({ statut: body.statut as "BROUILLON" | "VALIDEE" | "PAYEE" | "PARTIELLEMENT" | "IMPAYEE" }).where(eq(sales.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
