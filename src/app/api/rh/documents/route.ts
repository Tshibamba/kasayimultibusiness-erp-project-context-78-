import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employeeDocument } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employeeId = Number(body.employeeId);
    if (!employeeId) return NextResponse.json({ error: "Employé requis." }, { status: 400 });
    const [item] = await db.insert(employeeDocument).values({
      employeeId,
      type: body.type ?? "autre",
      nomFichier: body.nomFichier ?? null,
      url: body.url ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
