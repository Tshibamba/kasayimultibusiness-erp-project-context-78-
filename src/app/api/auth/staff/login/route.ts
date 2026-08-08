import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, loginHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setStaffSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_TENTATIVES = 5;
const BLOCAGE_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnu";

    const [user] = await db.select().from(users).where(eq(users.email, email));
    const logger = (success: boolean, reason: string) =>
      db.insert(loginHistory).values({ userId: user?.id ?? null, email, success, reason, ip });

    if (!user) {
      await logger(false, "Utilisateur introuvable");
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }
    if (!user.isActive) {
      await logger(false, "Compte désactivé");
      return NextResponse.json({ error: "Compte désactivé. Contactez l'administrateur." }, { status: 403 });
    }
    // Blocage temporaire
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      await logger(false, "Compte bloqué");
      return NextResponse.json({ error: "Compte temporairement bloqué après plusieurs tentatives. Réessayez plus tard." }, { status: 423 });
    }
    if (!user.passwordHash) {
      await logger(false, "Mot de passe non initialisé");
      return NextResponse.json({ error: "Compte non initialisé." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      const attempts = (user.failedAttempts ?? 0) + 1;
      if (attempts >= MAX_TENTATIVES) {
        await db.update(users).set({ failedAttempts: 0, lockedUntil: new Date(Date.now() + BLOCAGE_MS) }).where(eq(users.id, user.id));
        await logger(false, `Compte bloqué (${MAX_TENTATIVES} échecs)`);
        return NextResponse.json({ error: `Compte bloqué ${MAX_TENTATIVES} tentatives incorrectes. Réessayez dans 15 min.` }, { status: 423 });
      }
      await db.update(users).set({ failedAttempts: attempts }).where(eq(users.id, user.id));
      await logger(false, "Mot de passe incorrect");
      return NextResponse.json({ error: `Identifiants incorrects. (${MAX_TENTATIVES - attempts} tentative(s) restante(s))` }, { status: 401 });
    }

    // Succès : réinitialisation du compteur + session
    await db.update(users).set({ failedAttempts: 0, lockedUntil: null }).where(eq(users.id, user.id));
    await logger(true, "Connexion réussie");
    await setStaffSession(user.id, user.email);
    return NextResponse.json({ ok: true, staff: { id: user.id, name: user.name, roleId: user.roleId } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
