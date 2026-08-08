import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isNull, eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Initialise un mot de passe par défaut ("admin123") pour les agents sans mot de passe.
// À exécuter une fois au déploiement ; à changer ensuite pour chaque utilisateur.
export async function POST() {
  const DEFAULT = "admin123";
  const sansMdp = await db.select({ id: users.id }).from(users).where(isNull(users.passwordHash));
  let updated = 0;
  for (const u of sansMdp) {
    const hash = await hashPassword(DEFAULT);
    await db.update(users).set({ passwordHash: hash }).where(eq(users.id, u.id));
    updated++;
  }
  return NextResponse.json({ ok: true, initialises: updated, motDePasseParDefaut: sansMdp.length > 0 ? DEFAULT : null });
}
