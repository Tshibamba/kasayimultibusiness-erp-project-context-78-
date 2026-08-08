import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recolte } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cultureId = Number(body.cultureId);
    if (!cultureId) return NextResponse.json({ error: "Culture requise." }, { status: 400 });
    const [item] = await db.insert(recolte).values({
      cultureId,
      quantite: String(body.quantite ?? 0),
      unite: body.unite ?? null,
      qualite: body.qualite ?? null,
      pertes: String(body.pertes ?? 0),
      date: body.date ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
