import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const titre = String(body.titre ?? "").trim();
    if (!titre) return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
    const slug = body.slug?.trim() ? slugify(String(body.slug)) : slugify(titre);
    const [item] = await db
      .insert(articles)
      .values({
        titre,
        slug,
        extrait: String(body.extrait ?? "").trim() || titre,
        contenu: String(body.contenu ?? "").trim() || titre,
        image: body.image ?? null,
        categorie: body.categorie ?? null,
        auteur: body.auteur || "Direction KasayiMultiBusiness",
        isPublished: true,
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
