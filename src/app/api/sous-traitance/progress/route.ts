import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectProgress, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = Number(body.projectId);
    const avancement = Number(body.avancement);
    if (!projectId || Number.isNaN(avancement)) {
      return NextResponse.json({ error: "Projet et avancement requis." }, { status: 400 });
    }

    const [item] = await db.insert(projectProgress).values({
      projectId,
      avancement: String(avancement),
      date: body.date ?? new Date().toISOString().slice(0, 10),
      note: body.note ?? null,
    }).returning();

    // Met à jour aussi l'avancement global du projet
    await db.update(projects).set({ avancement: String(avancement) }).where(eq(projects.id, projectId));

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
