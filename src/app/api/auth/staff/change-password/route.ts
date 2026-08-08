import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword, getCurrentStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
    const body = await req.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit faire au moins 6 caractères." }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, staff.id));
    if (!user || !user.passwordHash) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });

    const hash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.id, staff.id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
