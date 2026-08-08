import { db } from "@/db";
import {
  stockIntrant, alerteStock, commerceProducts, sales, employees,
  accounts, vehicles, trips, projects, events,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { toNum } from "@/lib/format";

export type RapportGlobal = {
  agriValeur: number;
  agriAlertes: number;
  commerceValeur: number;
  caCommerce: number;
  creances: number;
  masseSalariale: number;
  effectif: number;
  tresorerie: number;
  flotteValeur: number;
  revenusTransport: number;
  budgetSousTraitance: number;
  projetsEncours: number;
  caTraiteur: number;
};

export async function getRapportGlobal(): Promise<RapportGlobal> {
  const [stocks, alertes, produits, ventes, emps, comptes, vehs, trajets, projets, evts] = await Promise.all([
    db.select().from(stockIntrant),
    db.select().from(alerteStock).where(eq(alerteStock.statut, "ACTIVE")),
    db.select().from(commerceProducts),
    db.select().from(sales),
    db.select().from(employees),
    db.select().from(accounts),
    db.select().from(vehicles),
    db.select().from(trips),
    db.select().from(projects),
    db.select().from(events),
  ]);

  return {
    agriValeur: stocks.reduce((s, x) => s + toNum(x.valeurStock), 0),
    agriAlertes: alertes.length,
    commerceValeur: produits.reduce((s, p) => s + toNum(p.stock) * toNum(p.prixAchat), 0),
    caCommerce: ventes.filter((v) => v.statut === "PAYEE").reduce((s, v) => s + toNum(v.totalTTC), 0),
    creances: ventes.filter((v) => v.statut !== "PAYEE").reduce((s, v) => s + toNum(v.totalTTC), 0),
    masseSalariale: emps.reduce((s, e) => s + toNum(e.salaireBase), 0),
    effectif: emps.length,
    tresorerie: comptes.reduce((s, c) => s + toNum(c.solde), 0),
    flotteValeur: vehs.reduce((s, v) => s + toNum(v.coutAchat), 0),
    revenusTransport: trajets.reduce((s, t) => s + toNum(t.revenu), 0),
    budgetSousTraitance: projets.reduce((s, p) => s + toNum(p.budget), 0),
    projetsEncours: projets.filter((p) => p.statut === "encours").length,
    caTraiteur: evts.reduce((s, e) => s + toNum(e.montantTotal), 0),
  };
}

export function syntheseModules(r: RapportGlobal) {
  return [
    { module: "Agriculture", indicateur: "Valeur du stock", montant: r.agriValeur, couleur: "#1B4F72", emoji: "🌱" },
    { module: "Commerce général", indicateur: "Valeur du stock", montant: r.commerceValeur, couleur: "#2E86AB", emoji: "🛒" },
    { module: "Commerce général", indicateur: "CA encaissé", montant: r.caCommerce, couleur: "#27AE60", emoji: "💵" },
    { module: "Transport", indicateur: "Revenus trajets", montant: r.revenusTransport, couleur: "#F0A500", emoji: "🚚" },
    { module: "Sous-traitance", indicateur: "Budget cumulé", montant: r.budgetSousTraitance, couleur: "#8E44AD", emoji: "🏗️" },
    { module: "Service traiteur", indicateur: "CA potentiel", montant: r.caTraiteur, couleur: "#E67E22", emoji: "🍽️" },
    { module: "Ressources humaines", indicateur: "Masse salariale / mois", montant: r.masseSalariale, couleur: "#16A085", emoji: "👥" },
    { module: "Trésorerie", indicateur: "Solde total", montant: r.tresorerie, couleur: "#34495E", emoji: "💰" },
  ];
}

export function chartValeurs(r: RapportGlobal) {
  return [
    { module: "Stock agri", valeur: r.agriValeur },
    { module: "Stock commerce", valeur: r.commerceValeur },
    { module: "Trésorerie", valeur: r.tresorerie },
    { module: "Masse salariale", valeur: r.masseSalariale },
    { module: "Flotte", valeur: r.flotteValeur },
    { module: "Budget chantiers", valeur: r.budgetSousTraitance },
  ];
}

export function chartRevenus(r: RapportGlobal) {
  return [
    { name: "Commerce", value: r.caCommerce },
    { name: "Transport", value: r.revenusTransport },
    { name: "Traiteur", value: r.caTraiteur },
  ].filter((x) => x.value > 0);
}
