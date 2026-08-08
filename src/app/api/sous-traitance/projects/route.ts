import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db
      .insert(projects)
      .values({
        nom: body.nom,
        type: body.type ?? null,
        client: body.client ?? null,
        localisation: body.localisation ?? null,
        dateDebut: body.dateDebut ?? null,
        dateFin: body.dateFin ?? null,
        budget: String(body.budget ?? 0),
        avancement: String(body.avancement ?? 0),
        statut: body.statut ?? "encours",
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
