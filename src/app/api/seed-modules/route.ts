import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  employees, accounts, transactions, commerceProducts, sales,
  vehicles, drivers, trips, projects, events,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function isEmpty(tableName: string): Promise<boolean> {
  const r = await db.execute(sql`SELECT 1 FROM ${sql.identifier(tableName)} LIMIT 1`);
  return (r.rows?.length ?? 0) === 0;
}

export async function GET() {
  return POST();
}

export async function POST() {
  const rapport: string[] = [];

  if (await isEmpty("employees")) {
    await db.insert(employees).values([
      { prenom: "Jean", nom: "Mukendi", genre: "M", departement: "Agriculture", poste: "Chef de culture", salaireBase: "850000", typeContrat: "CDI", dateEmbauche: "2023-03-01", telephone: "+243 810 100 001" },
      { prenom: "Marie", nom: "Kabongo", genre: "F", departement: "Commerce", poste: "Vendeuse", salaireBase: "450000", typeContrat: "CDI", dateEmbauche: "2023-09-15", telephone: "+243 820 200 002" },
      { prenom: "Paul", nom: "Tshibangu", genre: "M", departement: "Transport", poste: "Chauffeur", salaireBase: "520000", typeContrat: "CDI", dateEmbauche: "2022-06-10", telephone: "+243 990 300 003" },
      { prenom: "Esther", nom: "Nkulu", genre: "F", departement: "Administration", poste: "Comptable", salaireBase: "950000", typeContrat: "CDI", dateEmbauche: "2021-01-05", telephone: "+243 810 400 004" },
      { prenom: "Joseph", nom: "Kalenga", genre: "M", departement: "Agriculture", poste: "Manœuvre", salaireBase: "180000", typeContrat: "JOURNALIER", dateEmbauche: "2024-10-01", telephone: "+243 970 500 005" },
    ]);
    rapport.push("employés");
  }

  if (await isEmpty("accounts")) {
    const [caisse, banque] = await db.insert(accounts).values([
      { nom: "Caisse principale", type: "CAISSE", solde: "12500000", devise: "CDF" },
      { nom: "Banque Rawbank", type: "BANQUE", solde: "48000000", devise: "CDF" },
      { nom: "Caisse agriculture", type: "CAISSE", solde: "3200000", devise: "CDF" },
    ]).returning({ id: accounts.id });
    void caisse; void banque;
    await db.insert(transactions).values([
      { accountId: 1, type: "ENTREE", montant: "5000000", description: "Vente de maïs", module: "agriculture" },
      { accountId: 1, type: "SORTIE", montant: "1800000", description: "Achat intrants", module: "agriculture" },
      { accountId: 2, type: "ENTREE", montant: "12000000", description: "Virement client", module: "commerce" },
    ]);
    rapport.push("comptes & transactions");
  }

  if (await isEmpty("commerce_products")) {
    await db.insert(commerceProducts).values([
      { nom: "Ciment 42.5 (50kg)", categorie: "Matériaux", unite: "sac", prixAchat: "28000", prixVente: "32000", stockMin: "50", stock: "120" },
      { nom: "Fer à béton 12mm", categorie: "Matériaux", unite: "barre", prixAchat: "15000", prixVente: "18500", stockMin: "40", stock: "28" },
      { nom: "Sac de riz 25kg", categorie: "Alimentation", unite: "sac", prixAchat: "42000", prixVente: "48000", stockMin: "30", stock: "80" },
      { nom: "Huile végétale 5L", categorie: "Alimentation", unite: "bidon", prixAchat: "18000", prixVente: "22000", stockMin: "20", stock: "60" },
      { nom: "Sucre blanc 1kg", categorie: "Alimentation", unite: "kg", prixAchat: "3500", prixVente: "4200", stockMin: "100", stock: "200" },
    ]);
    rapport.push("produits commerce");
  }

  if (await isEmpty("sales")) {
    await db.insert(sales).values([
      { client: "Comptoir Bâtiment Plus", reference: "FAC-COM-000001", totalHT: "1600000", taxe: "256000", totalTTC: "1856000", statut: "PAYEE" },
      { client: "Restaurant Le Kat", reference: "FAC-COM-000002", totalHT: "480000", taxe: "76800", totalTTC: "556800", statut: "PAYEE" },
      { client: "Client comptant", reference: "FAC-COM-000003", totalHT: "96000", taxe: "15360", totalTTC: "111360", statut: "IMPAYEE" },
    ]);
    rapport.push("ventes");
  }

  if (await isEmpty("vehicles")) {
    await db.insert(vehicles).values([
      { plaque: "CGA 1234", marque: "Toyota", modele: "Hilux", type: "Pick-up", capacite: "1T", coutAchat: "45000000", statut: "actif" },
      { plaque: "CGA 5678", marque: "Volvo", modele: "FH", type: "Camion", capacite: "10T", coutAchat: "120000000", statut: "actif" },
      { plaque: "CGA 9012", marque: "Isuzu", modele: "NPR", type: "Camionnette", capacite: "3T", coutAchat: "38000000", statut: "maintenance" },
    ]);
    await db.insert(drivers).values([
      { nom: "Paul Tshibangu", telephone: "+243 990 300 003", vehicleId: 1 },
      { nom: "Augustin Mwepu", telephone: "+243 815 600 006", vehicleId: 2 },
    ]);
    await db.insert(trips).values([
      { vehicleId: 1, driverId: 1, client: "SOTRKI", origine: "Kananga", destination: "Kolwezi", revenu: "850000", statut: "termine" },
      { vehicleId: 2, driverId: 2, client: "Gécamines", origine: "Kananga", destination: "Likasi", revenu: "1200000", statut: "encours" },
    ]);
    rapport.push("transport");
  }

  if (await isEmpty("projects")) {
    await db.insert(projects).values([
      { nom: "Aménagement parcelle communale", type: "Génie civil", client: "Commune de Kasayi", budget: "25000000", avancement: "60", statut: "encours", dateDebut: "2025-01-15" },
      { nom: "Clôture site agricole", type: "Maçonnerie", client: "KasayiMultiBusiness", budget: "8000000", avancement: "100", statut: "termine", dateDebut: "2024-09-01", dateFin: "2024-11-30" },
    ]);
    rapport.push("projets");
  }

  if (await isEmpty("events")) {
    await db.insert(events).values([
      { nomClient: "Famille Kabongo", typeEvenement: "Mariage", lieu: "Salle Karavia", nbInvites: 300, montantTotal: "4500000", statut: "planifie", dateEvenement: new Date(Date.now() + 20 * 86400000) },
      { nomClient: "Entreprise Gécamines", typeEvenement: "Séminaire", lieu: "Hôtel Pullman", nbInvites: 80, montantTotal: "1800000", statut: "confirme", dateEvenement: new Date(Date.now() + 5 * 86400000) },
    ]);
    rapport.push("événements");
  }

  return NextResponse.json({ ok: true, modules: rapport });
}
