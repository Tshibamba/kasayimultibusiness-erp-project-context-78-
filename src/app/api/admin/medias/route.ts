import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services, articles, companySettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET : liste toutes les images modifiables
export async function GET() {
  const [srv, art, settings] = await Promise.all([
    db.select({ id: services.id, nom: services.nom, emoji: services.emoji, image: services.image, slug: services.slug }).from(services).where(eq(services.isPublished, true)),
    db.select({ id: articles.id, titre: articles.titre, image: articles.image }).from(articles).where(eq(articles.isPublished, true)),
    db.select().from(companySettings).limit(1),
  ]);

  return NextResponse.json({
    services: srv,
    articles: art,
    logo: settings[0]?.logoUrl ?? null,
    nomEntreprise: settings[0]?.nom ?? "KasayiMultiBusiness",
  });
}

// PATCH : met à jour une image
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, url } = body;
    if (!url) return NextResponse.json({ error: "URL requise." }, { status: 400 });

    if (type === "service") {
      await db.update(services).set({ image: url }).where(eq(services.id, Number(id)));
    } else if (type === "article") {
      await db.update(articles).set({ image: url }).where(eq(articles.id, Number(id)));
    } else if (type === "logo") {
      const [existing] = await db.select().from(companySettings).limit(1);
      if (existing) {
        await db.update(companySettings).set({ logoUrl: url }).where(eq(companySettings.id, existing.id));
      }
    } else {
      return NextResponse.json({ error: "Type invalide." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
