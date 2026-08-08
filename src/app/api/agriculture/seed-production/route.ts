import { NextResponse } from "next/server";
import { db } from "@/db";
import { parcelle, culture, traitementCulture, recolte, venteAgricole } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function isEmpty(t: string): Promise<boolean> {
  const r = await db.execute(sql`SELECT 1 FROM ${sql.identifier(t)} LIMIT 1`);
  return (r.rows?.length ?? 0) === 0;
}

export async function GET() {
  return POST();
}

export async function POST() {
  if (!(await isEmpty("parcelle"))) {
    return NextResponse.json({ alreadySeeded: true });
  }

  const parcelles = await db
    .insert(parcelle)
    .values([
      { nom: "Parcelle Nord", localisation: "Kasayi Nord", surface: "5", uniteSurface: "ha" },
      { nom: "Parcelle Sud", localisation: "Kasayi Sud", surface: "8", uniteSurface: "ha" },
      { nom: "Champ Est", localisation: "Route de Likasi", surface: "3", uniteSurface: "ha" },
    ])
    .returning();
  const [p1, p2, p3] = parcelles.map((p) => p.id);

  const cultures = await db
    .insert(culture)
    .values([
      { parcelleId: p1, nom: "Maïs — Saison 2026", variete: "H614", superficie: "5", mainOeuvre: "800000", dateSemis: "2026-02-01", dateRecoltePrevue: "2026-06-15", statut: "en_cours" },
      { parcelleId: p2, nom: "Soja — 2026", variete: "TGX", superficie: "8", mainOeuvre: "1200000", dateSemis: "2026-01-15", dateRecoltePrevue: "2026-05-30", statut: "en_cours" },
      { parcelleId: p2, nom: "Arachide — 2025", superficie: "3", mainOeuvre: "450000", statut: "recolte" },
      { parcelleId: p3, nom: "Pomme de terre — 2025", superficie: "3", mainOeuvre: "600000", statut: "recolte" },
    ])
    .returning();
  const [mais, soja, arachide, pdt] = cultures.map((c) => c.id);

  await db.insert(traitementCulture).values([
    { cultureId: mais, type: "Fertilisation", produit: "DAP", quantite: "5", unite: "sac", cout: "350000", date: "2026-02-10" },
    { cultureId: mais, type: "Désherbage", produit: "Glyphosate", quantite: "10", unite: "L", cout: "90000", date: "2026-02-25" },
    { cultureId: mais, type: "Traitement phytosanitaire", produit: "Mancozèbe", quantite: "4", unite: "kg", cout: "120000", date: "2026-03-15" },
    { cultureId: soja, type: "Fertilisation", produit: "NPK", quantite: "8", unite: "sac", cout: "500000", date: "2026-01-20" },
    { cultureId: soja, type: "Traitement phytosanitaire", produit: "Insecticide", quantite: "3", unite: "L", cout: "150000", date: "2026-02-15" },
    { cultureId: arachide, type: "Fertilisation", produit: "DAP", quantite: "3", unite: "sac", cout: "200000", date: "2025-02-01" },
    { cultureId: pdt, type: "Fertilisation", produit: "NPK", quantite: "3", unite: "sac", cout: "250000", date: "2025-03-01" },
    { cultureId: pdt, type: "Traitement phytosanitaire", produit: "Fongicide", quantite: "2", unite: "kg", cout: "80000", date: "2025-04-01" },
  ]);

  await db.insert(recolte).values([
    { cultureId: arachide, quantite: "4000", unite: "kg", qualite: "Bonne", date: "2025-06-20" },
    { cultureId: pdt, quantite: "6000", unite: "kg", qualite: "Excellente", date: "2025-07-05" },
  ]);

  await db.insert(venteAgricole).values([
    { cultureId: arachide, produit: "Arachide", client: "Marché central", quantite: "4000", unite: "kg", prixUnitaire: "250", total: "1000000", date: "2025-06-25" },
    { cultureId: pdt, produit: "Pomme de terre", client: "Hôtel Karavia", quantite: "6000", unite: "kg", prixUnitaire: "400", total: "2400000", date: "2025-07-10" },
  ]);

  return NextResponse.json({ ok: true, parcelles: 3, cultures: 4 });
}
