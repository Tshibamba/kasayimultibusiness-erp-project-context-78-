import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Notre flotte" };

export default async function FlottePage() {
  const vehicules = await db
    .select({ id: vehicles.id, marque: vehicles.marque, modele: vehicles.modele, type: vehicles.type, capacite: vehicles.capacite, plaque: vehicles.plaque, annee: vehicles.annee })
    .from(vehicles)
    .where(eq(vehicles.statut, "actif"));

  const parType = vehicules.reduce((acc, v) => {
    const t = (v.type ?? "Autre").toLowerCase();
    if (!acc[t]) acc[t] = [];
    acc[t].push(v);
    return acc;
  }, {} as Record<string, typeof vehicules>);

  const TYPES_LABELS: Record<string, { label: string; emoji: string }> = {
    camion: { label: "Camions", emoji: "🚛" },
    "pick-up": { label: "Pick-ups", emoji: "🛻" },
    bus: { label: "Bus", emoji: "🚌" },
    tracteur: { label: "Tracteurs", emoji: "🚜" },
    camionnette: { label: "Camionnettes", emoji: "🚐" },
    autre: { label: "Autres", emoji: "🚗" },
  };

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-br from-marine to-ciel py-14 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-or-clair"><Truck size={14} /> Logistique</span>
          <h1 className="mt-4 font-display text-3xl font-bold lg:text-5xl">Notre flotte</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            {vehicules.length} véhicule(s) disponible(s) pour le transport de marchandises et de personnes dans le Kasaï Central et au-delà.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        {Object.entries(parType).map(([type, list]) => {
          const info = TYPES_LABELS[type] ?? { label: type, emoji: "🚗" };
          return (
            <div key={type} className="mb-12">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-3xl">{info.emoji}</span>
                <div>
                  <h2 className="font-display text-xl font-bold text-marine">{info.label}</h2>
                  <p className="text-xs text-slate-400">{list.length} véhicule(s)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="flex items-center justify-between bg-gradient-to-r from-marine to-[#1d5a82] px-5 py-4 text-white">
                      <div>
                        <p className="font-display text-lg font-bold">{v.marque ?? "Véhicule"} {v.modele ?? ""}</p>
                        <p className="text-xs text-ciel-clair">{v.type ?? "—"}</p>
                      </div>
                      {v.annee && <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">{v.annee}</span>}
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Immatriculation</span>
                        <span className="font-mono font-semibold text-slate-700">{v.plaque}</span>
                      </div>
                      {v.capacite && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Capacité</span>
                          <span className="font-semibold text-slate-700">{v.capacite}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {vehicules.length === 0 && <p className="py-16 text-center text-slate-400">Aucun véhicule à afficher pour le moment.</p>}
      </section>
    </>
  );
}
