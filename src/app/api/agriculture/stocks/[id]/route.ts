import { NextRequest, NextResponse } from "next/server";
import { getStockFiche, mettreAJourSeuils } from "@/lib/agriculture/stock-service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fiche = await getStockFiche(Number(id));
  if (!fiche) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }
  return NextResponse.json(fiche);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const seuilAlerte = Number(body.seuilAlerte ?? 0);
    const seuilCritique = Number(body.seuilCritique ?? 0);

    if (seuilCritique > seuilAlerte) {
      return NextResponse.json(
        { error: "Le seuil critique doit être inférieur ou égal au seuil d'alerte." },
        { status: 400 }
      );
    }

    const result = await mettreAJourSeuils(Number(id), seuilAlerte, seuilCritique);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
