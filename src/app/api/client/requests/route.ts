import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentClient } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const items = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.clientAccountId, client.id))
    .orderBy(desc(serviceRequests.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const client = await getCurrentClient();
    if (!client) return NextResponse.json({ error: "Connectez-vous pour soumettre une demande." }, { status: 401 });
    const body = await req.json();
    const description = String(body.description ?? "").trim();
    if (!description) {
      return NextResponse.json({ error: "Décrivez votre demande." }, { status: 400 });
    }
    const [item] = await db
      .insert(serviceRequests)
      .values({
        clientAccountId: client.id,
        nom: client.nom,
        email: client.email,
        telephone: body.telephone ?? client.telephone ?? null,
        activite: body.activite ?? null,
        description,
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
