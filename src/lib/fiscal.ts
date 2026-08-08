import type { Devise } from "@/lib/format";

// ─────────────────────────────────────────────────────────────
// Fiscalité RD Congo — SYSCOHADA
// ─────────────────────────────────────────────────────────────

export const TVA_TAUX = 0.16; // 16 % standard RDC
export const CNSS_PATRONALE = 0.05; // 5 % part employeur
export const CNSS_SALARIALE = 0.035; // 3,5 % part salarié
export const IBP_TAUX = 0.3; // 30 % Impôt sur les Bénéfices et Profits

export function calculerTVA(montantHT: number): number {
  return Math.round(montantHT * TVA_TAUX * 100) / 100;
}
export function calculerTTC(montantHT: number): number {
  return Math.round(montantHT * (1 + TVA_TAUX) * 100) / 100;
}
export function calculerCNSS(salaireBrut: number) {
  return {
    patronale: Math.round(salaireBrut * CNSS_PATRONALE * 100) / 100,
    salariale: Math.round(salaireBrut * CNSS_SALARIALE * 100) / 100,
  };
}

// ─────────────────────────────────────────────────────────────
// IPR — Impôt Professionnel sur les Rémunérations (barème progressif mensuel)
// Barème INDICATIF — à valider avec l'administration fiscale.
// Tranches mensuelles en CDF.
// ─────────────────────────────────────────────────────────────

export type TrancheIPR = { plafond: number | null; taux: number };

export const TRANCHES_IPR: TrancheIPR[] = [
  { plafond: 72000, taux: 0.0 },
  { plafond: 150000, taux: 0.03 },
  { plafond: 360000, taux: 0.15 },
  { plafond: 720000, taux: 0.2 },
  { plafond: 1320000, taux: 0.25 },
  { plafond: null, taux: 0.3 },
];

export function calculerIPR(baseImposableMensuelle: number): number {
  let impot = 0;
  let plafondPrecedent = 0;
  for (const t of TRANCHES_IPR) {
    const plafond = t.plafond ?? Infinity;
    if (baseImposableMensuelle > plafondPrecedent) {
      const tranche = Math.min(baseImposableMensuelle, plafond) - plafondPrecedent;
      impot += tranche * t.taux;
      plafondPrecedent = plafond;
    } else break;
  }
  return Math.round(impot * 100) / 100;
}

// ─────────────────────────────────────────────────────────────
// Conversion d'un nombre en lettres (français) — pour les factures
// ─────────────────────────────────────────────────────────────

const UNITES = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];
const DIZAINES = [
  "", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt",
];

function deuxChiffres(n: number): string {
  if (n < 20) return UNITES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 7) {
    if (u === 1) return "soixante et onze";
    return `soixante-${UNITES[10 + u]}`;
  }
  if (d === 9) return `quatre-vingt-${UNITES[10 + u]}`;
  if (d === 8) {
    if (u === 0) return "quatre-vingts";
    if (u === 1) return "quatre-vingt-un";
    return `quatre-vingt-${UNITES[u]}`;
  }
  const base = DIZAINES[d];
  if (u === 0) return base;
  if (u === 1) return `${base} et un`;
  return `${base}-${UNITES[u]}`;
}

function troisChiffres(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let s = "";
  if (h > 0) {
    s = h === 1 ? "cent" : `${UNITES[h]} cent`;
    if (h > 1 && r === 0) s += "s";
  }
  if (r > 0) s += (s ? " " : "") + deuxChiffres(r);
  return s;
}

export function nombreEnLettres(n: number, opts?: { majuscule?: boolean }): string {
  const majuscule = opts?.majuscule ?? false;
  const neg = n < 0;
  let v = Math.abs(Math.round(n));
  if (v === 0) return majuscule ? "ZÉRO" : "zéro";

  const groupes: number[] = [];
  while (v > 0) {
    groupes.push(v % 1000);
    v = Math.floor(v / 1000);
  }

  const parts: string[] = [];
  for (let i = groupes.length - 1; i >= 0; i--) {
    const g = groupes[i];
    if (g === 0) continue;
    let mot = troisChiffres(g);
    if (i === 1) {
      mot = g === 1 ? "mille" : `${troisChiffres(g)} mille`;
    } else if (i === 2) {
      mot = `${troisChiffres(g)} ${g > 1 ? "millions" : "million"}`;
    } else if (i === 3) {
      mot = `${troisChiffres(g)} ${g > 1 ? "milliards" : "milliard"}`;
    }
    parts.push(mot);
  }

  let res = parts.join(" ");
  if (neg) res = `moins ${res}`;
  return majuscule ? res.toUpperCase() : res;
}

export function montantEnLettres(
  montant: number,
  devise: Devise = "CDF",
  opts?: { majuscule?: boolean }
): string {
  const entier = Math.floor(Math.abs(montant));
  const mots = nombreEnLettres(entier);
  const unites: Record<Devise, { s: string; p: string }> = {
    CDF: { s: "franc congolais", p: "francs congolais" },
    USD: { s: "dollar américain", p: "dollars américains" },
    EUR: { s: "euro", p: "euros" },
  };
  const u = entier <= 1 ? unites[devise].s : unites[devise].p;
  let res = `${mots} ${u}`;
  const dec = Math.round((Math.abs(montant) - entier) * 100);
  if (dec > 0) res += ` et ${nombreEnLettres(dec)} centime${dec > 1 ? "s" : ""}`;
  return opts?.majuscule ? res.toUpperCase() : res;
}
