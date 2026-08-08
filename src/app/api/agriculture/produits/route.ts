import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { produitIntrant, stockIntrant } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { determinerStatut } from "@/lib/agriculture/stock-service";
import { toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: produitIntrant.id,
      nom: produitIntrant.nom,
      categorie: produitIntrant.categorie,
      unite: produitIntrant.unite,
      description: produitIntrant.description,
      seuilAlerte: produitIntrant.seuilAlerte,
      seuilCritique: produitIntrant.seuilCritique,
      quantite: stockIntrant.quantite,
      cmup: stockIntrant.cmup,
      statut: stockIntrant.statut,
      createdAt: produitIntrant.createdAt,
    })
    .from(produitIntrant)
    .leftJoin(stockIntrant, eq(stockIntrant.produitId, produitIntrant.id))
    .orderBy(asc(produitIntrant.nom));

  const items = rows.map((r) => ({
    ...r,
    quantite: toNum(r.quantite),
    cmup: toNum(r.cmup),
    statut:
      r.statut ??
      determinerStatut(
        toNum(r.quantite),
        toNum(r.seuilAlerte),
        toNum(r.seuilCritique)
      ),
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    if (!nom) {
      return NextResponse.json(
        { error: "Le nom du produit est obligatoire." },
        { status: 400 }
      );
    }
    const [produit] = await db
      .insert(produitIntrant)
      .values({
        nom,
        categorie: body.categorie ?? "AUTRE",
        unite: body.unite ?? "kg",
        description: body.description ?? null,
        seuilAlerte: String(body.seuilAlerte ?? 0),
        seuilCritique: String(body.seuilCritique ?? 0),
      })
      .returning();

    // Initialise la fiche de stock
    await db.insert(stockIntrant).values({
      produitId: produit.id,
      quantite: "0",
      cmup: "0",
      valeurStock: "0",
      statut: "RUPTURE",
    });

    return NextResponse.json({ produit }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Erreur lors de la création." },
      { status: 500 }
    );
  }
}
