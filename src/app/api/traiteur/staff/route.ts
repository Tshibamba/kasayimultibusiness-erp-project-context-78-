import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cateringStaff } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventId = Number(body.eventId);
    const nom = String(body.nom ?? "").trim();
    if (!eventId || !nom) return NextResponse.json({ error: "Événement et nom requis." }, { status: 400 });
    const [item] = await db.insert(cateringStaff).values({
      eventId,
      nom,
      role: body.role ?? null,
      cout: String(body.cout ?? 0),
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
