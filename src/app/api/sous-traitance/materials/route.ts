import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectMaterial } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const projectId = Number(body.projectId);
    const designation = String(body.designation ?? "").trim();
    if (!projectId || !designation) return NextResponse.json({ error: "Projet et désignation requis." }, { status: 400 });
    const [item] = await db.insert(projectMaterial).values({
      projectId,
      designation,
      quantite: String(body.quantite ?? 0),
      unite: body.unite ?? null,
      coutUnitaire: String(body.coutUnitaire ?? 0),
      fournisseur: body.fournisseur ?? null,
      date: body.date ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
