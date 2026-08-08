import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companySettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const valeurs = {
      nom: body.nom ?? "KasayiMultiBusiness",
      slogan: body.slogan ?? null,
      adresse: body.adresse ?? null,
      ville: body.ville ?? null,
      telephone: body.telephone ?? null,
      email: body.email ?? null,
      nif: body.nif ?? null,
      rc: body.rc ?? null,
      rccm: body.rccm ?? null,
      devisePrincipale: body.devisePrincipale ?? "CDF",
      tvaTaux: String(body.tvaTaux ?? 16),
      updatedAt: new Date(),
    };

    const [existing] = await db.select().from(companySettings).limit(1);
    if (existing) {
      await db
        .update(companySettings)
        .set(valeurs)
        .where(eq(companySettings.id, existing.id));
    } else {
      await db.insert(companySettings).values(valeurs);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
