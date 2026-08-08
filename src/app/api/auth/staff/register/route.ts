import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setStaffSession } from "@/lib/auth";

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
    if (exists) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const hash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hash,
        roleId: "saisie", // Rôle minimal par défaut (agent de saisie)
        isActive: false, // Inactif → admin doit activer
        phone: body.phone ?? null,
      })
      .returning();

    const [role] = await db.select().from(roles).where(eq(roles.id, "saisie")).limit(1);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
      message: "Compte créé avec succès. Un administrateur doit l'activer avant que vous puissiez vous connecter.",
      needsActivation: true,
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
