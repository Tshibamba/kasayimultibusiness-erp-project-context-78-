import { NextResponse } from "next/server";
import { db } from "@/db";
import { vehicles, trips, fuelRecord, maintenance, vehicleDocument, vehicleRental, toll, transportExpense } from "@/db/schema";
import { sql } from "drizzle-orm";

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
  const vehs = await db.select().from(vehicles);
  const [v1, v2, v3] = vehs;
  if (!v1) return NextResponse.json({ error: "Aucun véhicule." }, { status: 400 });
  const trajets = await db.select().from(trips);
  const rapport: string[] = [];

  if (await isEmpty("fuel_record")) {
    await db.insert(fuelRecord).values([
      { vehicleId: v1.id, date: "2026-07-01", litres: "50", cout: "180000", odometer: 12000 },
      { vehicleId: v2.id, date: "2026-07-05", litres: "200", cout: "720000", odometer: 45000 },
      { vehicleId: v1.id, date: "2026-07-20", litres: "40", cout: "144000", odometer: 13500 },
    ]);
    await db.insert(maintenance).values([
      { vehicleId: v1.id, date: "2026-06-15", type: "Vidange", cout: "45000", prochainKm: 18000 },
      { vehicleId: (v3 ?? v1).id, date: "2026-07-10", type: "Freins", cout: "120000", prochaineDate: dstr(25) },
    ]);
    await db.insert(vehicleDocument).values([
      { vehicleId: v1.id, type: "assurance", numero: "ASS-2026-001", dateExpiration: dstr(-10) },
      { vehicleId: (v2 ?? v1).id, type: "visite technique", numero: "VT-2026-014", dateExpiration: dstr(15) },
      { vehicleId: v1.id, type: "carte grise", numero: "CG-78945", dateExpiration: dstr(200) },
    ]);
    rapport.push("carburant/entretien/documents");
  }

  if (await isEmpty("vehicle_rental")) {
    await db.insert(vehicleRental).values([
      { description: "Camion 10T — Volvo FH", proprietaire: "TransitLoc SARL", coutLocation: "850000", dateDebut: "2026-07-01", dateFin: "2026-07-31", statut: "en_cours" },
      { description: "Semi-remorque 40T", proprietaire: "KasaÃ¯ Central Logistics", coutLocation: "1200000", dateDebut: "2026-07-10", dateFin: "2026-08-10", statut: "en_cours" },
    ]);
    if (trajets[0]) {
      await db.insert(toll).values([
        { tripId: trajets[0].id, lieu: "Barrière de Kolwezi", cout: "15000", date: "2026-07-03" },
        { tripId: trajets[1]?.id ?? trajets[0].id, lieu: "Péage de Likasi", cout: "10000", date: "2026-07-06" },
      ]);
    }
    await db.insert(transportExpense).values([
      { vehicleId: v1.id, type: "Lavage", description: "Nettoyage véhicule", montant: "5000", date: "2026-07-02" },
      { vehicleId: v2.id, type: "Parking", montant: "8000", date: "2026-07-04" },
    ]);
    rapport.push("locations/péages/dépenses");
  }

  return NextResponse.json({ ok: true, rapport });
}
