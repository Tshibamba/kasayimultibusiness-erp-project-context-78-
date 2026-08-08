import { db } from "@/db";
import { exchangeRates } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Devise } from "@/lib/format";

// ─────────────────────────────────────────────────────────────
// Multi-devises — CDF (référence) / USD / EUR
// Taux chargés depuis la table exchange_rates (dernière saisie),
// avec repli sur des valeurs par défaut.
// ─────────────────────────────────────────────────────────────

export const TAUX_DEFAUT: Record<Devise, number> = {
  CDF: 1,
  USD: 2850,
  EUR: 3050,
};

export async function chargerTaux(): Promise<Record<Devise, number>> {
  const map: Record<Devise, number> = { ...TAUX_DEFAUT };
  try {
    const rows = await db
      .select()
      .from(exchangeRates)
      .orderBy(desc(exchangeRates.date));
    const vus = new Set<Devise>();
    for (const r of rows) {
      const d = r.devise as Devise;
      if (d !== "CDF" && !vus.has(d)) {
        map[d] = Number(r.rate);
        vus.add(d);
      }
    }
  } catch {
    /* repli sur valeurs par défaut */
  }
  return map;
}

export function convertir(
  montantCdf: number,
  devise: Devise,
  taux: Record<Devise, number> = TAUX_DEFAUT
): number {
  return Math.round((montantCdf / (taux[devise] || 1)) * 100) / 100;
}

export function formatMontantAvecTaux(
  montantCdf: number,
  devise: Devise,
  taux: Record<Devise, number> = TAUX_DEFAUT
): string {
  const valeur = convertir(montantCdf, devise, taux);
  const fmt = new Intl.NumberFormat("fr-CD", {
    minimumFractionDigits: devise === "CDF" ? 0 : 2,
    maximumFractionDigits: devise === "CDF" ? 0 : 2,
  }).format(valeur);
  const symboles: Record<Devise, string> = { CDF: "FC", USD: "$", EUR: "€" };
  return `${fmt} ${symboles[devise]}`;
}
