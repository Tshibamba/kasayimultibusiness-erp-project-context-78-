import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectTeam } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = Number(body.projectId);
    const nom = String(body.nom ?? "").trim();
    if (!projectId || !nom) return NextResponse.json({ error: "Projet et nom requis." }, { status: 400 });
    const [item] = await db.insert(projectTeam).values({
      projectId,
      nom,
      role: body.role ?? null,
      coutMainOeuvre: String(body.coutMainOeuvre ?? 0),
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
