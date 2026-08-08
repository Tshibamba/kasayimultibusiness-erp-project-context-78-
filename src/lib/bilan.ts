import { db } from "@/db";
import {
  venteAgricole, mouvementStock, traitementCulture, culture,
  trips, fuelRecord, maintenance, toll, transportExpense, vehicleRental,
  projectPayment, projectMaterial, projectExpense, projectTeam,
  events, cateringExpense, cateringStaff, cateringPurchase,
  sales, commercePurchase,
} from "@/db/schema";
import { toNum } from "@/lib/format";

type Flux = { montant: number; date: Date | string | null };

function dansPeriode(d: Flux["date"], annee: number, mois?: number | null): boolean {
  if (!d) return false;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return false;
  if (dt.getFullYear() !== annee) return false;
  if (mois != null && dt.getMonth() + 1 !== mois) return false;
  return true;
}

function somme(flux: Flux[], annee: number, mois?: number | null): number {
  return flux.reduce((s, f) => s + (dansPeriode(f.date, annee, mois) ? f.montant : 0), 0);
}

export type BilanService = { service: string; emoji: string; recettes: number; depenses: number; benefice: number; couleur: string };
export type BilanGlobal = { services: BilanService[]; totalRecettes: number; totalDepenses: number; beneficeNet: number };
export type PointMensuel = { mois: string; recettes: number; depenses: number; benefice: number };

const MOIS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

async function getFlux() {
  const [ventesAgri, mvtsAgri, traitements, cultures, trajets, fuels, entretiens, peages, tExp, locations, payProj, matProj, expProj, teamProj, eventsT, expT, staffT, purchT, ventesCom, achatsCom] = await Promise.all([
    db.select().from(venteAgricole),
    db.select().from(mouvementStock),
    db.select().from(traitementCulture),
    db.select().from(culture),
    db.select().from(trips),
    db.select().from(fuelRecord),
    db.select().from(maintenance),
    db.select().from(toll),
    db.select().from(transportExpense),
    db.select().from(vehicleRental),
    db.select().from(projectPayment),
    db.select().from(projectMaterial),
    db.select().from(projectExpense),
    db.select().from(projectTeam),
    db.select().from(events),
    db.select().from(cateringExpense),
    db.select().from(cateringStaff),
    db.select().from(cateringPurchase),
    db.select().from(sales),
    db.select().from(commercePurchase),
  ]);

  const flux = (arr: { montant: string | number; date: Date | string | null }[]): Flux[] => arr.map((a) => ({ montant: toNum(a.montant), date: a.date }));

  return {
    agriRecettes: flux(ventesAgri.map((v) => ({ montant: v.total, date: v.date }))),
    agriDepenses: [
      ...mvtsAgri.filter((m) => m.type === "ENTREE").map((m) => ({ montant: toNum(m.valeur), date: m.createdAt })),
      ...traitements.map((t) => ({ montant: toNum(t.cout), date: t.date })),
      ...cultures.map((c) => ({ montant: toNum(c.mainOeuvre), date: c.createdAt })),
    ],
    transpRecettes: trajets.map((t) => ({ montant: toNum(t.revenu), date: t.createdAt })),
    transpDepenses: [
      ...fuels.map((f) => ({ montant: toNum(f.cout), date: f.date })),
      ...entretiens.map((m) => ({ montant: toNum(m.cout), date: m.date })),
      ...peages.map((p) => ({ montant: toNum(p.cout), date: p.date })),
      ...tExp.map((e) => ({ montant: toNum(e.montant), date: e.date })),
      ...locations.map((l) => ({ montant: toNum(l.coutLocation), date: l.dateDebut })),
    ],
    strRecettes: payProj.map((p) => ({ montant: toNum(p.montant), date: p.date })),
    strDepenses: [
      ...matProj.map((m) => ({ montant: toNum(m.quantite) * toNum(m.coutUnitaire), date: m.date })),
      ...expProj.map((e) => ({ montant: toNum(e.montant), date: e.date })),
      ...teamProj.map((t) => ({ montant: toNum(t.coutMainOeuvre), date: t.createdAt })),
    ],
    trtRecettes: eventsT.map((e) => ({ montant: toNum(e.montantTotal), date: e.dateEvenement })),
    trtDepenses: [
      ...expT.map((e) => ({ montant: toNum(e.montant), date: e.date })),
      ...staffT.map((s) => ({ montant: toNum(s.cout), date: s.createdAt })),
      ...purchT.map((p) => ({ montant: toNum(p.quantite) * toNum(p.prixAchat), date: p.date })),
    ],
    comRecettes: ventesCom.map((v) => ({ montant: toNum(v.totalTTC), date: v.date })),
    comDepenses: achatsCom.map((a) => ({ montant: toNum(a.total), date: a.date })),
  };
}

export async function getBilanGlobal(annee: number, mois?: number | null): Promise<BilanGlobal> {
  const f = await getFlux();
  const def = (service: string, emoji: string, couleur: string, recettes: Flux[], depenses: Flux[]): BilanService => {
    const r = somme(recettes, annee, mois);
    const d = somme(depenses, annee, mois);
    return { service, emoji, couleur, recettes: r, depenses: d, benefice: r - d };
  };

  const services = [
    def("Agriculture", "🌱", "#1B4F72", f.agriRecettes, f.agriDepenses),
    def("Commerce général", "🛒", "#2E86AB", f.comRecettes, f.comDepenses),
    def("Transport", "🚚", "#F0A500", f.transpRecettes, f.transpDepenses),
    def("Sous-traitance", "🏗️", "#8E44AD", f.strRecettes, f.strDepenses),
    def("Service traiteur", "🍽️", "#E67E22", f.trtRecettes, f.trtDepenses),
  ];

  return {
    services,
    totalRecettes: services.reduce((s, x) => s + x.recettes, 0),
    totalDepenses: services.reduce((s, x) => s + x.depenses, 0),
    beneficeNet: services.reduce((s, x) => s + x.benefice, 0),
  };
}

export async function getEvolutionMensuelle(annee: number): Promise<PointMensuel[]> {
  const f = await getFlux();
  const recettes = [...f.agriRecettes, ...f.comRecettes, ...f.transpRecettes, ...f.strRecettes, ...f.trtRecettes];
  const depenses = [...f.agriDepenses, ...f.comDepenses, ...f.transpDepenses, ...f.strDepenses, ...f.trtDepenses];
  return MOIS.map((m, i) => {
    const r = somme(recettes, annee, i + 1);
    const d = somme(depenses, annee, i + 1);
    return { mois: m, recettes: r, depenses: d, benefice: r - d };
  });
}
