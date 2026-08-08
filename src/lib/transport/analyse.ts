import { db } from "@/db";
import {
  vehicles, trips, fuelRecord, maintenance, toll, transportExpense, vehicleRental,
} from "@/db/schema";
import { toNum } from "@/lib/format";

export type BeneficeVehicule = {
  id: number;
  plaque: string;
  nom: string;
  type: string | null;
  revenu: number;
  carburant: number;
  entretien: number;
  peages: number;
  autres: number;
  coutTotal: number;
  benefice: number;
  litresTotal: number;
  kmTotal: number;
  consommationMoyenne: number;
  coutParKm: number;
};

export async function getTransportSynthese() {
  const [vehicules, trajets, fuels, entretiens, peages, depenses, locations] = await Promise.all([
    db.select().from(vehicles),
    db.select().from(trips),
    db.select().from(fuelRecord),
    db.select().from(maintenance),
    db.select().from(toll),
    db.select().from(transportExpense),
    db.select().from(vehicleRental),
  ]);

  const benefices: BeneficeVehicule[] = vehicules.map((v) => {
    const vehTrips = trajets.filter((t) => t.vehicleId === v.id);
    const tripIds = new Set(vehTrips.map((t) => t.id));
    const revenu = vehTrips.reduce((s, t) => s + toNum(t.revenu), 0);
    const carburant = fuels.filter((f) => f.vehicleId === v.id).reduce((s, f) => s + toNum(f.cout), 0);
    const entretien = entretiens.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + toNum(m.cout), 0);
    const peage = peages.filter((p) => tripIds.has(p.tripId ?? -1)).reduce((s, p) => s + toNum(p.cout), 0);
    const autres = depenses.filter((d) => d.vehicleId === v.id).reduce((s, d) => s + toNum(d.montant), 0);
    const coutTotal = carburant + entretien + peage + autres;
    const vehFuels = fuels.filter((f) => f.vehicleId === v.id);
    const litresTotal = vehFuels.reduce((s, f) => s + toNum(f.litres), 0);
    const odometers = vehFuels.map((f) => f.odometer).filter((o): o is number => o != null);
    const kmTotal = odometers.length >= 2 ? Math.max(...odometers) - Math.min(...odometers) : 0;
    return {
      id: v.id,
      plaque: v.plaque,
      nom: `${v.marque ?? ""} ${v.modele ?? ""}`.trim() || v.plaque,
      type: v.type,
      revenu,
      carburant,
      entretien,
      peages: peage,
      autres,
      coutTotal,
      benefice: revenu - coutTotal,
      litresTotal,
      kmTotal,
      consommationMoyenne: kmTotal > 0 ? Math.round((litresTotal / kmTotal) * 100 * 10) / 10 : 0,
      coutParKm: kmTotal > 0 ? Math.round(carburant / kmTotal) : 0,
    };
  });

  const coutLocationTotal = locations.reduce((s, l) => s + toNum(l.coutLocation), 0);
  const beneficeTotal = benefices.reduce((s, b) => s + b.benefice, 0);
  const revenuTotal = benefices.reduce((s, b) => s + b.revenu, 0);

  const parType: Record<string, number> = {};
  vehicules.forEach((v) => {
    const t = (v.type ?? "Autre").toLowerCase();
    parType[t] = (parType[t] ?? 0) + 1;
  });

  return {
    benefices,
    locations,
    coutLocationTotal,
    beneficeTotal,
    revenuTotal,
    nbVehicules: vehicules.length,
    nbLocations: locations.length,
    parType,
  };
}
