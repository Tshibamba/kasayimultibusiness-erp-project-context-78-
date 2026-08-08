import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(events).orderBy(desc(events.dateEvenement));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db
      .insert(events)
      .values({
        nomClient: body.nomClient,
        typeEvenement: body.typeEvenement ?? null,
        dateEvenement: body.dateEvenement ? new Date(body.dateEvenement) : null,
        lieu: body.lieu ?? null,
        nbInvites: body.nbInvites ? Number(body.nbInvites) : null,
        montantTotal: String(body.montantTotal ?? 0),
        statut: body.statut ?? "planifie",
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
