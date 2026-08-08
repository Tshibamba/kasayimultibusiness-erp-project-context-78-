import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  events, cateringIngredient, menu as menuTable, cateringOrder, cateringStaff, cateringExpense, cateringInvoice,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import { calculerTVA, calculerTTC } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

async function isEmpty(t: string): Promise<boolean> {
  const r = await db.execute(sql`SELECT 1 FROM ${sql.identifier(t)} LIMIT 1`);
  return (r.rows?.length ?? 0) === 0;
}

const dstr = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

export async function GET() {
  return POST();
}

export async function POST() {
  const rapport: string[] = [];

  if (await isEmpty("catering_ingredient")) {
    await db.insert(cateringIngredient).values([
      { nom: "Riz", unite: "sac 25kg", quantite: "10", prixAchat: "42000", seuilAlerte: "3" },
      { nom: "Poulet", unite: "kg", quantite: "5", prixAchat: "4500", seuilAlerte: "20" },
      { nom: "Huile végétale", unite: "L", quantite: "30", prixAchat: "5000", seuilAlerte: "10" },
      { nom: "Pommes de terre", unite: "sac", quantite: "8", prixAchat: "30000", seuilAlerte: "5" },
      { nom: "Boissons", unite: "caisse", quantite: "15", prixAchat: "18000", seuilAlerte: "6" },
    ]);
    rapport.push("ingrédients");
  }

  if (await isEmpty("menu")) {
    await db.insert(menuTable).values([
      { nom: "Menu Classique", description: "Entrée, plat principal, dessert", prixParPersonne: "15000" },
      { nom: "Menu Prestige", description: "Menu gastronomique complet", prixParPersonne: "25000" },
      { nom: "Menu Buffet", description: "Buffet à volonté", prixParPersonne: "12000" },
    ]);
    rapport.push("menus");
  }

  if (await isEmpty("catering_order")) {
    await db.insert(cateringOrder).values([
      { client: "Famille Ilunga", telephone: "+243 810 700 007", dateSouhaitee: dstr(10), nbPersonnes: 150, statut: "confirmee", description: "Mariage — Menu Prestige" },
      { client: "Entreprise SOMI", telephone: "+243 820 800 008", dateSouhaitee: dstr(20), nbPersonnes: 80, statut: "nouvelle", description: "Séminaire — Menu Buffet" },
    ]);
    rapport.push("commandes");
  }

  if (await isEmpty("catering_staff")) {
    const evenements = await db.select().from(events);
    const [e1, e2] = evenements;
    if (e1) {
      await db.insert(cateringStaff).values([
        { eventId: e1.id, nom: "Chef Kasongo", role: "Chef cuisinier", cout: "200000" },
        { eventId: e1.id, nom: "Équipe service", role: "Serveurs (x4)", cout: "150000" },
      ]);
      await db.insert(cateringExpense).values([
        { eventId: e1.id, type: "Décoration", montant: "300000", date: dstr(-5) },
        { eventId: e1.id, type: "Transport", montant: "100000", date: dstr(-5) },
      ]);
      const ht1 = toNumSafe(e1.montantTotal) || 4500000;
      await db.insert(cateringInvoice).values({ eventId: e1.id, numero: "FAC-TRT-0001", montantHT: String(ht1), taxe: String(calculerTVA(ht1)), totalTTC: String(calculerTTC(ht1)), date: dstr(-3), statut: "payee" });
    }
    if (e2) {
      await db.insert(cateringStaff).values([
        { eventId: e2.id, nom: "Chef Mwamba", role: "Chef cuisinier", cout: "100000" },
        { eventId: e2.id, nom: "Équipe service", role: "Serveurs (x2)", cout: "80000" },
      ]);
      await db.insert(cateringExpense).values([{ eventId: e2.id, type: "Logistique", montant: "120000", date: dstr(-2) }]);
      const ht2 = toNumSafe(e2.montantTotal) || 1800000;
      await db.insert(cateringInvoice).values({ eventId: e2.id, numero: "FAC-TRT-0002", montantHT: String(ht2), taxe: String(calculerTVA(ht2)), totalTTC: String(calculerTTC(ht2)), date: dstr(-1), statut: "emise" });
    }
    rapport.push("événements (staff/dépenses/factures)");
  }

  return NextResponse.json({ ok: true, rapport });
}

function toNumSafe(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}
