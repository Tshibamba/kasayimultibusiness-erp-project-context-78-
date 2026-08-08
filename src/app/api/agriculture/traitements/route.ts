import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { traitementCulture } from "@/db/schema";
import { enregistrerMouvement } from "@/lib/agriculture/stock-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cultureId = Number(body.cultureId);
    if (!cultureId) return NextResponse.json({ error: "Culture requise." }, { status: 400 });
    const intrantProduitId = body.intrantProduitId ? Number(body.intrantProduitId) : null;

    const [item] = await db.insert(traitementCulture).values({
      cultureId,
      type: body.type ?? null,
      produit: body.produit ?? null,
      quantite: String(body.quantite ?? 0),
      unite: body.unite ?? null,
      cout: String(body.cout ?? 0),
      date: body.date ?? null,
    }).returning();

    // Liaison production ↔ stock : décrémente l'intrant choisi et déclenche les alertes
    if (intrantProduitId) {
      await enregistrerMouvement({
        produitId: intrantProduitId,
        type: "SORTIE",
        quantite: Number(body.quantite ?? 0),
        motif: `Traitement (${body.type ?? ""}) — culture #${cultureId}`,
      }).catch(() => {});
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
