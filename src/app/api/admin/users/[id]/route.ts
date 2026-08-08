import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const valeurs: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.isActive === "boolean") valeurs.isActive = body.isActive;
    if (body.roleId !== undefined) valeurs.roleId = body.roleId || null;
    if (body.name) valeurs.name = String(body.name);
    if (body.email) valeurs.email = String(body.email).toLowerCase();
    if (body.newPassword) {
      if (String(body.newPassword).length < 6) return NextResponse.json({ error: "Mot de passe ≥ 6 caractères." }, { status: 400 });
      valeurs.passwordHash = await hashPassword(String(body.newPassword));
      valeurs.failedAttempts = 0;
      valeurs.lockedUntil = null;
    }
    await db.update(users).set(valeurs).where(eq(users.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
