import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clientAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!nom || !email || password.length < 6) {
      return NextResponse.json({ error: "Nom, email et mot de passe (≥ 6 caractères) requis." }, { status: 400 });
    }
    const [exists] = await db.select().from(clientAccounts).where(eq(clientAccounts.email, email));
    if (exists) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }
    const hash = await hashPassword(password);
    const [acc] = await db
      .insert(clientAccounts)
      .values({ nom, email, passwordHash: hash, telephone: body.telephone ?? null, entreprise: body.entreprise ?? null })
      .returning();
    await setSession(acc.id, acc.email);
    return NextResponse.json({ ok: true, client: { id: acc.id, nom: acc.nom, email: acc.email } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
