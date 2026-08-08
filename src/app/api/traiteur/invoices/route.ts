import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cateringInvoice } from "@/db/schema";
import { calculerTVA, calculerTTC } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventId = Number(body.eventId);
    if (!eventId) return NextResponse.json({ error: "Événement requis." }, { status: 400 });
    const montantHT = Number(body.montantHT ?? 0);
    const [item] = await db.insert(cateringInvoice).values({
      eventId,
      numero: body.numero ?? `FAC-TRT-${Date.now().toString().slice(-6)}`,
      montantHT: String(montantHT),
      taxe: String(calculerTVA(montantHT)),
      totalTTC: String(calculerTTC(montantHT)),
      date: body.date ?? null,
      statut: body.statut ?? "emise",
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
