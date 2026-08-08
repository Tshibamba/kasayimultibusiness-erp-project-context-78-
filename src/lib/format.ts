// ─────────────────────────────────────────────────────────────
// Helpers de formatage — KasayiMultiBusiness ERP
// Référence : CDF — Devises : CDF, USD, EUR
// Locale : fr-CD (RD Congo) — Fuseau : Africa/Lubumbashi
// ─────────────────────────────────────────────────────────────

export type Devise = "CDF" | "USD" | "EUR";

// Taux indicatifs (référence CDF). À ajuster dans les paramètres.
export const TAUX_CHANGE: Record<Devise, number> = {
  CDF: 1,
  USD: 2850,
  EUR: 3050,
};

export function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export function round(v: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round((v + Number.EPSILON) * f) / f;
}

export function convertir(
  montantCdf: number,
  deviseCible: Devise = "CDF"
): number {
  const taux = TAUX_CHANGE[deviseCible] || 1;
  return round(montantCdf / taux, 2);
}

export function formatMontant(
  montantCdf: number,
  devise: Devise = "CDF",
  options: { withSymbol?: boolean } = {}
): string {
  const valeur = convertir(montantCdf, devise);
  const fmt = new Intl.NumberFormat("fr-CD", {
    minimumFractionDigits: devise === "CDF" ? 0 : 2,
    maximumFractionDigits: devise === "CDF" ? 0 : 2,
  }).format(valeur);
  const symboles: Record<Devise, string> = {
    CDF: "FC",
    USD: "$",
    EUR: "€",
  };
  const sym = options.withSymbol === false ? "" : ` ${symboles[devise]}`;
  return `${fmt}${sym}`;
}

export function formatNombre(valeur: number, decimals = 2): string {
  return new Intl.NumberFormat("fr-CD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(valeur);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-CD", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Africa/Lubumbashi",
  }).format(d);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-CD", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lubumbashi",
  }).format(d);
}

export function formatHeureRelative(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} j`;
  return formatDate(d);
}
