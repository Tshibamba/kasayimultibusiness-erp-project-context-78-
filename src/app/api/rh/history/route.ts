import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employeeHistory } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employeeId = Number(body.employeeId);
    const description = String(body.description ?? "").trim();
    if (!employeeId || !description) return NextResponse.json({ error: "Employé et description requis." }, { status: 400 });
    const [item] = await db.insert(employeeHistory).values({
      employeeId,
      type: body.type ?? "autre",
      description,
      date: body.date ?? null,
      details: body.details ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
