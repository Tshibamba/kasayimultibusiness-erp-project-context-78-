import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cateringOrder } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = String(body.client ?? "").trim();
    if (!client) return NextResponse.json({ error: "Client requis." }, { status: 400 });
    const [item] = await db.insert(cateringOrder).values({
      client,
      telephone: body.telephone ?? null,
      dateSouhaitee: body.dateSouhaitee ?? null,
      nbPersonnes: body.nbPersonnes ? Number(body.nbPersonnes) : null,
      description: body.description ?? null,
      statut: body.statut ?? "nouvelle",
      eventId: body.eventId ? Number(body.eventId) : null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
