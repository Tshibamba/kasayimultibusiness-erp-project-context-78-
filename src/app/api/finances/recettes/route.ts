import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recette } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(recette).orderBy(desc(recette.date));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const source = String(body.source ?? "").trim();
    if (!source) return NextResponse.json({ error: "Source de la recette requise." }, { status: 400 });
    const [item] = await db.insert(recette).values({
      source,
      description: body.description ?? null,
      montant: String(body.montant ?? 0),
      date: body.date ?? null,
      activite: body.activite ?? "general",
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
