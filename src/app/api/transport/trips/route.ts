import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trips } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db.insert(trips).values({
      vehicleId: body.vehicleId ? Number(body.vehicleId) : null,
      driverId: body.driverId ? Number(body.driverId) : null,
      client: body.client ?? null,
      origine: body.origine ?? null,
      destination: body.destination ?? null,
      dateDepart: body.dateDepart ? new Date(body.dateDepart) : null,
      dateRetour: body.dateRetour ? new Date(body.dateRetour) : null,
      kilometrage: body.kilometrage ? Number(body.kilometrage) : null,
      revenu: String(body.revenu ?? 0),
      statut: body.statut ?? "planifie",
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
