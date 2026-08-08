import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { venteAgricole } from "@/db/schema";
import { round } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cultureId = Number(body.cultureId);
    if (!cultureId) return NextResponse.json({ error: "Culture requise." }, { status: 400 });
    const qte = Number(body.quantite ?? 0);
    const pu = Number(body.prixUnitaire ?? 0);
    const [item] = await db.insert(venteAgricole).values({
      cultureId,
      produit: body.produit ?? null,
      client: body.client ?? null,
      quantite: String(qte),
      unite: body.unite ?? null,
      prixUnitaire: String(pu),
      total: String(round(qte * pu, 2)),
      date: body.date ?? null,
      montantPaye: String(body.montantPaye ?? 0),
      statutPaiement: body.statutPaiement ?? "non_paye",
      datePaiement: body.datePaiement ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
