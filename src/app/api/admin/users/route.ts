import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: "Nom, email et mot de passe (≥ 6 caractères) requis." }, { status: 400 });
    }
    const [exists] = await db.select().from(users).where(eq(users.email, email));
    if (exists) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

    const hash = await hashPassword(password);
    const [user] = await db.insert(users).values({
      name, email, passwordHash: hash, roleId: body.roleId ?? null, isActive: true,
    }).returning();
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
