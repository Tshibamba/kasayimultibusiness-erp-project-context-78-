import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    if (!nom) return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
    const slug = body.slug?.trim() ? slugify(String(body.slug)) : slugify(nom);
    const [item] = await db
      .insert(services)
      .values({
        slug,
        nom,
        emoji: body.emoji ?? null,
        accroche: body.accroche ?? null,
        description: body.description ?? null,
        image: body.image ?? null,
        ordre: Number(body.ordre) || 0,
        isPublished: true,
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
