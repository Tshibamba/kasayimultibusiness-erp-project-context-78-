import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessage, notifications } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (!nom || !email || !message) {
      return NextResponse.json({ error: "Nom, email et message sont obligatoires." }, { status: 400 });
    }
    const [item] = await db
      .insert(contactMessage)
      .values({
        nom,
        email,
        telephone: body.telephone ?? null,
        sujet: body.sujet ?? null,
        activite: body.activite ?? null,
        message,
      })
      .returning();

    // Notification interne pour les agents
    await db.insert(notifications).values({
      title: `Nouveau message de ${nom}`,
      message: message.slice(0, 120),
      type: "contact",
      link: null,
    });

    return NextResponse.json({ ok: true, id: item.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
