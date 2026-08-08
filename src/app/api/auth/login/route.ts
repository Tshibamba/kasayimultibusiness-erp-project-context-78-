import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clientAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
    }
    const [acc] = await db.select().from(clientAccounts).where(eq(clientAccounts.email, email));
    if (!acc) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }
    const ok = await verifyPassword(password, acc.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }
    await setSession(acc.id, acc.email);
    return NextResponse.json({ ok: true, client: { id: acc.id, nom: acc.nom, email: acc.email } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
