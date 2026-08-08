import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { clientAccounts, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_CLIENT = "kmb_session";
const COOKIE_STAFF = "kmb_staff";
const SECRET = process.env.SESSION_SECRET || "kasayi-dev-secret-change-in-production";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 jours

// ── Signature / vérification du jeton (HMAC-SHA256) ───────────
function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token: string): { sub: number; email: string; exp: number; type?: string } | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Mots de passe ─────────────────────────────────────────────
export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ── Session CLIENT (site public) ──────────────────────────────
export async function setSession(clientId: number, email: string) {
  const token = sign({ sub: clientId, email, type: "client", exp: Date.now() + MAX_AGE_SEC * 1000 });
  const c = await cookies();
  c.set(COOKIE_CLIENT, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE_SEC, secure: process.env.NODE_ENV === "production" });
}
export async function clearSession() {
  const c = await cookies();
  c.set(COOKIE_CLIENT, "", { path: "/", maxAge: 0 });
}
export async function getCurrentClient() {
  const c = await cookies();
  const token = c.get(COOKIE_CLIENT)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  const [account] = await db
    .select({ id: clientAccounts.id, nom: clientAccounts.nom, email: clientAccounts.email, telephone: clientAccounts.telephone, entreprise: clientAccounts.entreprise })
    .from(clientAccounts)
    .where(eq(clientAccounts.id, payload.sub));
  return account ?? null;
}

// ── Session AGENT / STAFF (ERP) ───────────────────────────────
export async function setStaffSession(userId: number, email: string) {
  const token = sign({ sub: userId, email, type: "staff", exp: Date.now() + MAX_AGE_SEC * 1000 });
  const c = await cookies();
  c.set(COOKIE_STAFF, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE_SEC, secure: process.env.NODE_ENV === "production" });
}
export async function clearStaffSession() {
  const c = await cookies();
  c.set(COOKIE_STAFF, "", { path: "/", maxAge: 0 });
}
export async function getCurrentStaff() {
  const c = await cookies();
  const token = c.get(COOKIE_STAFF)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload || payload.type !== "staff") return null;
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, roleId: users.roleId, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, payload.sub));
  if (!user || !user.isActive) return null;
  return user;
}
