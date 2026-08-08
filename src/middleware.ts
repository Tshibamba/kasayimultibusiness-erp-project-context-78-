import { NextResponse, type NextRequest } from "next/server";

const SECRET = process.env.SESSION_SECRET || "kasayi-dev-secret-change-in-production";

// Préfixes de pages PROTÉGÉES (back-office / financier)
const PROTECTED_PAGES = [
  "/dashboard", "/agriculture", "/rh", "/commerce", "/comptabilite",
  "/transport", "/sous-traitance", "/traiteur", "/admin", "/bilan", "/rapports",
];

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function isStaff(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("kmb_staff")?.value;
  if (!token) return false;
  const [data, sig] = token.split(".");
  if (!data || !sig) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expected = b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
    if (expected !== sig) return false;
    const payload = JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.type !== "staff") return false;
    if (typeof payload.exp === "number" && payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api");
  const isProtectedPage = PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Pages publiques (site vitrine + connexion) → laissées passantes
  if (!isApi && !isProtectedPage) return NextResponse.next();

  const ok = await isStaff(req);
  if (ok) return NextResponse.next();

  // Route API protégée sans session → 401 JSON
  if (isApi) return NextResponse.json({ error: "Non autorisé. Connexion agent requise." }, { status: 401 });

  // Page back-office sans session → redirection vers la connexion
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // Exclut les fichiers statiques et les API réellement publiques
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/client|api/services|api/faqs|api/contact|api/newsletter|api/health|api/seed|api/setup|api/ai).*)",
  ],
};
