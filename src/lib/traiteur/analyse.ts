import { db } from "@/db";
import {
  events, cateringStaff, cateringExpense, cateringIngredient, cateringInvoice,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { toNum } from "@/lib/format";

export type EventSynthese = {
  id: number;
  nomClient: string;
  typeEvenement: string | null;
  dateEvenement: Date | null;
  lieu: string | null;
  nbInvites: number | null;
  montantTotal: number;
  depenses: number;
  personnel: number;
  benefice: number;
  statut: string;
};

export async function getEventsSynthese(): Promise<{ items: EventSynthese[]; caPotentiel: number; beneficeTotal: number }> {
  const [evenements, staff, depenses] = await Promise.all([
    db.select().from(events).orderBy(desc(events.dateEvenement)),
    db.select().from(cateringStaff),
    db.select().from(cateringExpense),
  ]);

  const items: EventSynthese[] = evenements.map((e) => {
    const dep = depenses.filter((d) => d.eventId === e.id).reduce((s, d) => s + toNum(d.montant), 0);
    const pers = staff.filter((s) => s.eventId === e.id).reduce((s, s2) => s + toNum(s2.cout), 0);
    const montant = toNum(e.montantTotal);
    return {
      id: e.id, nomClient: e.nomClient, typeEvenement: e.typeEvenement, dateEvenement: e.dateEvenement,
      lieu: e.lieu, nbInvites: e.nbInvites, montantTotal: montant, depenses: dep, personnel: pers,
      benefice: montant - dep - pers, statut: e.statut,
    };
  });

  return {
    items,
    caPotentiel: items.reduce((s, i) => s + i.montantTotal, 0),
    beneficeTotal: items.reduce((s, i) => s + i.benefice, 0),
  };
}

export type IngredientStock = {
  id: number;
  nom: string;
  unite: string | null;
  quantite: number;
  prixAchat: number;
  valeur: number;
  seuilAlerte: number;
  alerte: boolean;
};

export async function getStockAlimentaire(): Promise<{ items: IngredientStock[]; valeurTotale: number; alertes: number }> {
  const ingredients = await db.select().from(cateringIngredient);
  const items: IngredientStock[] = ingredients.map((i) => {
    const quantite = toNum(i.quantite);
    const prix = toNum(i.prixAchat);
    const seuil = toNum(i.seuilAlerte);
    return {
      id: i.id, nom: i.nom, unite: i.unite, quantite, prixAchat: prix,
      valeur: quantite * prix, seuilAlerte: seuil, alerte: seuil > 0 && quantite <= seuil,
    };
  });
  return {
    items,
    valeurTotale: items.reduce((s, i) => s + i.valeur, 0),
    alertes: items.filter((i) => i.alerte).length,
  };
}

export async function getEventDetail(id: number) {
  const rows = await db.select().from(events).where(eq(events.id, id));
  const e = rows[0];
  if (!e) return null;

  const [staff, depenses, invoices] = await Promise.all([
    db.select().from(cateringStaff).where(eq(cateringStaff.eventId, id)),
    db.select().from(cateringExpense).where(eq(cateringExpense.eventId, id)).orderBy(desc(cateringExpense.date)),
    db.select().from(cateringInvoice).where(eq(cateringInvoice.eventId, id)),
  ]);

  const dep = depenses.reduce((s, d) => s + toNum(d.montant), 0);
  const pers = staff.reduce((s, st) => s + toNum(st.cout), 0);
  const revenu = toNum(e.montantTotal);

  return { event: e, staff, depenses, invoices, dep, pers, revenu, couts: dep + pers, benefice: revenu - dep - pers };
}
