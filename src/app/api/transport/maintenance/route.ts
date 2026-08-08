import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const vehicleId = Number(body.vehicleId);
    if (!vehicleId) return NextResponse.json({ error: "Véhicule requis." }, { status: 400 });
    const [item] = await db.insert(maintenance).values({
      vehicleId,
      date: body.date ?? null,
      type: body.type ?? null,
      description: body.description ?? null,
      cout: String(body.cout ?? 0),
      prochainKm: body.prochainKm ? Number(body.prochainKm) : null,
      prochaineDate: body.prochaineDate ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
