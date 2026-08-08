import { NextRequest, NextResponse } from "next/server";
import { enregistrerMouvement } from "@/lib/agriculture/stock-service";
import type { TypeMouvement } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.produitId) {
      return NextResponse.json(
        { error: "Le produit est obligatoire." },
        { status: 400 }
      );
    }
    const quantite = Number(body.quantite);
    if (!Number.isFinite(quantite) || quantite === 0) {
      return NextResponse.json(
        { error: "La quantité doit être un nombre non nul." },
        { status: 400 }
      );
    }

    const type = (body.type as TypeMouvement) ?? "ENTREE";
    if (!["ENTREE", "SORTIE", "AJUSTEMENT"].includes(type)) {
      return NextResponse.json({ error: "Type invalide." }, { status: 400 });
    }

    const result = await enregistrerMouvement({
      produitId: Number(body.produitId),
      type,
      quantite,
      prixAchat: body.prixAchat != null ? Number(body.prixAchat) : null,
      motif: body.motif ?? null,
      reference: body.reference ?? null,
      fournisseurId: body.fournisseurId ?? null,
      modePaiement: body.modePaiement ?? null,
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Erreur lors du mouvement." },
      { status: 500 }
    );
  }
}
