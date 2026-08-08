import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectExpense } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = Number(body.projectId);
    if (!projectId) return NextResponse.json({ error: "Projet requis." }, { status: 400 });
    const [item] = await db.insert(projectExpense).values({
      projectId,
      type: body.type ?? null,
      description: body.description ?? null,
      montant: String(body.montant ?? 0),
      date: body.date ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
