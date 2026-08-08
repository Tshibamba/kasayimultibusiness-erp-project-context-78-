import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leaves } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "ID requis." }, { status: 400 });
    await db.update(leaves).set({
      statut: body.statut ?? undefined,
      approuvePar: body.approuvePar ?? undefined,
    }).where(eq(leaves.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employeeId = Number(body.employeeId);
    if (!employeeId) return NextResponse.json({ error: "Employé requis." }, { status: 400 });
    const [item] = await db.insert(leaves).values({
      employeeId,
      type: body.type ?? "Congé annuel",
      dateDebut: body.dateDebut ?? null,
      dateFin: body.dateFin ?? null,
      jours: String(body.jours ?? 1),
      statut: "pending",
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
