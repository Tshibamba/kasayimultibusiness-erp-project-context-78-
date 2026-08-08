import { db } from "@/db";
import {
  vehicles, drivers, trips, fuelRecord, maintenance, vehicleDocument, toll, transportExpense,
} from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { Truck, Wallet, TrendingUp, KeyRound, Fuel, Wrench, FileText, AlertTriangle, ShieldCheck, Route } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { getTransportSynthese } from "@/lib/transport/analyse";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TransportPage() {
  const [synthese, vehicules, chauffeurs, trajets, fuels, entretiens, docs, peages, depenses] = await Promise.all([
    getTransportSynthese(),
    db.select().from(vehicles).orderBy(asc(vehicles.marque)),
    db.select().from(drivers).orderBy(asc(drivers.nom)),
    db.select().from(trips).leftJoin(vehicles, eq(vehicles.id, trips.vehicleId)).orderBy(desc(trips.createdAt)).limit(8),
    db.select().from(fuelRecord).leftJoin(vehicles, eq(vehicles.id, fuelRecord.vehicleId)).orderBy(desc(fuelRecord.date)).limit(6),
    db.select().from(maintenance).leftJoin(vehicles, eq(vehicles.id, maintenance.vehicleId)).orderBy(desc(maintenance.date)).limit(6),
    db.select().from(vehicleDocument).leftJoin(vehicles, eq(vehicles.id, vehicleDocument.vehicleId)).orderBy(asc(vehicleDocument.dateExpiration)),
    db.select().from(toll).orderBy(desc(toll.date)).limit(8),
    db.select().from(transportExpense).leftJoin(vehicles, eq(vehicles.id, transportExpense.vehicleId)).orderBy(desc(transportExpense.date)).limit(8),
  ]);

  const vehicleOptions = vehicules.map((v) => ({ value: String(v.id), label: `${v.marque ?? ""} ${v.modele ?? ""} (${v.plaque})` }));
  const tripOptions = trajets.map((t) => ({ value: String(t.trips.id), label: `${t.trips.origine ?? "?"} → ${t.trips.destination ?? "?"}` }));

  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 86400000);
  const statutDoc = (d: Date | string | null) => {
    if (!d) return "inconnu";
    const date = new Date(d);
    if (date < today) return "expire";
    if (date <= in30) return "bientot";
    return "valide";
  };
  const docsAlerte = docs.filter((d) => ["expire", "bientot"].includes(statutDoc(d.vehicle_document.dateExpiration))).length;

  const kpis = [
    { label: "Véhicules propres", value: formatNombre(synthese.nbVehicules, 0), icon: Truck, tint: "bg-marine/10 text-marine" },
    { label: "Camions en location", value: formatNombre(synthese.nbLocations, 0), icon: KeyRound, tint: "bg-ciel/10 text-ciel" },
    { label: "Coût location (global)", value: formatMontant(synthese.coutLocationTotal, "CDF"), icon: Wallet, tint: "bg-or/15 text-[#c08700]" },
    { label: "Bénéfice flotte", value: formatMontant(synthese.beneficeTotal, "CDF"), icon: TrendingUp, tint: synthese.beneficeTotal >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Logistique</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Transport</h1>
          <p className="mt-1 text-sm text-slate-500">Véhicules propres &amp; loués, trajets, recettes, carburant, entretien, péages et bénéfices.</p>
        </div>
        <GenericForm endpoint="/api/transport/vehicles" title="Nouveau véhicule" triggerLabel="Nouveau véhicule" fields={[
          { name: "plaque", label: "Plaque", required: true }, { name: "marque", label: "Marque" }, { name: "modele", label: "Modèle" },
          { name: "type", label: "Type", placeholder: "Camion, Tracteur, Pick-up..." }, { name: "capacite", label: "Capacité" },
          { name: "coutAchat", label: "Coût d'achat (CDF)", type: "number" }, { name: "dateAchat", label: "Date d'achat", type: "date" }, { name: "annee", label: "Année", type: "number" },
          { name: "statut", label: "Statut", type: "select", options: [{ value: "actif", label: "Actif" }, { value: "maintenance", label: "Maintenance" }, { value: "inactif", label: "Inactif" }] },
        ]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5">
              <div className="flex items-start justify-between">
                <div><p className="text-sm font-medium text-slate-500">{k.label}</p><p className="mt-2 font-display text-xl font-bold text-slate-900">{k.value}</p></div>
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${k.tint}`}><Icon size={20} /></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Par type */}
      <Card className="flex flex-wrap items-center gap-2 p-4">
        <span className="text-sm font-semibold text-slate-500">Flotte par type :</span>
        {Object.entries(synthese.parType).length === 0 ? (
          <span className="text-sm text-slate-400">—</span>
        ) : Object.entries(synthese.parType).map(([t, n]) => (
          <span key={t} className="rounded-full bg-marine/10 px-3 py-1 text-xs font-bold capitalize text-marine">{t} : {n}</span>
        ))}
      </Card>

      {/* Bénéfices par véhicule */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5"><h2 className="font-display text-sm font-bold text-slate-900"><TrendingUp size={15} className="mb-0.5 mr-1 inline text-marine" />Bénéfices par véhicule (recettes − charges)</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Véhicule</th>
              <th className="px-5 py-2.5 text-right font-semibold">Recettes</th>
              <th className="px-5 py-2.5 text-right font-semibold">Carburant</th>
              <th className="px-5 py-2.5 text-right font-semibold">Entretien</th>
              <th className="px-5 py-2.5 text-right font-semibold">Péages</th>
              <th className="px-5 py-2.5 text-right font-semibold">Autres</th>
              <th className="px-5 py-2.5 text-right font-semibold">Bénéfice</th>
              <th className="px-5 py-2.5 text-right font-semibold">Conso.</th>
              <th className="px-5 py-2.5 text-right font-semibold">Coût/km</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {synthese.benefices.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3"><p className="font-semibold text-slate-900">{b.nom}</p><p className="font-mono text-xs text-slate-400">{b.plaque} · {b.type ?? "—"}</p></td>
                  <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(b.revenu, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMontant(b.carburant, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMontant(b.entretien, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMontant(b.peages, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-danger">{formatMontant(b.autres, "CDF")}</td>
                  <td className={`px-5 py-3 text-right font-bold ${b.benefice >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(b.benefice, "CDF")}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{b.consommationMoyenne > 0 ? formatNombre(b.consommationMoyenne, 1) + " L" : "—"}</td>
                  <td className="px-5 py-3 text-right text-slate-500">{b.coutParKm > 0 ? formatNombre(b.coutParKm, 0) + " FC" : "—"}</td>
                </tr>
              ))}
              {synthese.benefices.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Aucun véhicule.</td></tr>}
            </tbody>
            <tfoot><tr className="bg-slate-50 font-bold">
              <td className="px-5 py-3 text-slate-500">Total flotte</td>
              <td className="px-5 py-3 text-right text-emerald-600">{formatMontant(synthese.revenuTotal, "CDF")}</td>
              <td colSpan={4} className="px-5 py-3 text-right text-slate-400">Bénéfice global →</td>
              <td className={`px-5 py-3 text-right ${synthese.beneficeTotal >= 0 ? "text-emerald-600" : "text-danger"}`}>{formatMontant(synthese.beneficeTotal, "CDF")}</td>
            </tr></tfoot>
          </table>
        </div>
      </Card>

      {/* Locations */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><KeyRound size={15} className="mb-0.5 mr-1 inline text-marine" />Camions en location · Coût global {formatMontant(synthese.coutLocationTotal, "CDF")}</h2>
          <GenericForm endpoint="/api/transport/rentals" title="Nouvelle location" triggerLabel="Location" triggerVariant="outline" fields={[
            { name: "description", label: "Camion loué", required: true, placeholder: "ex. Camion 10T - Volvo" },
            { name: "proprietaire", label: "Propriétaire / loueur" },
            { name: "coutLocation", label: "Coût de location (CDF)", type: "number" },
            { name: "dateDebut", label: "Début", type: "date" }, { name: "dateFin", label: "Fin", type: "date" },
            { name: "statut", label: "Statut", type: "select", options: [{ value: "en_cours", label: "En cours" }, { value: "termine", label: "Terminé" }] },
          ]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-2.5 font-semibold">Camion</th><th className="px-5 py-2.5 font-semibold">Propriétaire</th>
              <th className="px-5 py-2.5 font-semibold">Période</th><th className="px-5 py-2.5 text-right font-semibold">Coût</th><th className="px-5 py-2.5 font-semibold">Statut</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {synthese.locations.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-900">{l.description}</td>
                  <td className="px-5 py-3 text-slate-600">{l.proprietaire ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(l.dateDebut)} → {formatDate(l.dateFin)}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{formatMontant(toNum(l.coutLocation), "CDF")}</td>
                  <td className="px-5 py-3"><span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${l.statut === "en_cours" ? "bg-ciel/15 text-ciel" : "bg-slate-100 text-slate-500"}`}>{l.statut}</span></td>
                </tr>
              ))}
              {synthese.locations.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucune location.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Péages & autres dépenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900">Péages</h2>
            <GenericForm endpoint="/api/transport/tolls" title="Nouveau péage" triggerLabel="Péage" triggerVariant="outline" fields={[
              { name: "tripId", label: "Trajet", type: "select", options: tripOptions },
              { name: "lieu", label: "Lieu / barrière" }, { name: "cout", label: "Coût (CDF)", type: "number" }, { name: "date", label: "Date", type: "date" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {peages.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{p.lieu ?? "Péage"}</p><p className="text-xs text-slate-400">{formatDate(p.date)}</p></div><p className="font-display text-sm font-bold text-danger">{formatMontant(toNum(p.cout), "CDF")}</p></div>
            ))}
            {peages.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun péage.</p>}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900">Autres dépenses</h2>
            <GenericForm endpoint="/api/transport/expenses" title="Nouvelle dépense" triggerLabel="Dépense" triggerVariant="outline" fields={[
              { name: "vehicleId", label: "Véhicule", type: "select", options: vehicleOptions },
              { name: "type", label: "Type", placeholder: "Lavage, parking, réparation..." }, { name: "montant", label: "Montant (CDF)", type: "number" }, { name: "date", label: "Date", type: "date" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {depenses.map((d) => (
              <div key={d.transport_expense.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{d.transport_expense.type ?? "Dépense"} — {d.vehicles?.plaque ?? "—"}</p><p className="text-xs text-slate-400">{d.transport_expense.description ?? formatDate(d.transport_expense.date)}</p></div><p className="font-display text-sm font-bold text-danger">{formatMontant(toNum(d.transport_expense.montant), "CDF")}</p></div>
            ))}
            {depenses.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucune dépense.</p>}
          </div>
        </Card>
      </div>

      {/* Carburant & Entretien */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><Fuel size={15} className="mb-0.5 mr-1 inline text-marine" />Carburant</h2>
            <GenericForm endpoint="/api/transport/fuel" title="Nouveau plein" triggerLabel="Plein" triggerVariant="outline" fields={[
              { name: "vehicleId", label: "Véhicule", type: "select", required: true, options: vehicleOptions }, { name: "litres", label: "Litres", type: "number" }, { name: "cout", label: "Coût (CDF)", type: "number" }, { name: "odometer", label: "Kilométrage", type: "number" }, { name: "date", label: "Date", type: "date" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {fuels.map((f) => (<div key={f.fuel_record.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{f.vehicles?.plaque ?? "—"}</p><p className="text-xs text-slate-400">{formatNombre(toNum(f.fuel_record.litres))} L · {formatDate(f.fuel_record.date)}</p></div><p className="font-display text-sm font-bold text-slate-900">{formatMontant(toNum(f.fuel_record.cout), "CDF")}</p></div>))}
            {fuels.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun plein.</p>}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h2 className="font-display text-sm font-bold text-slate-900"><Wrench size={15} className="mb-0.5 mr-1 inline text-marine" />Entretiens</h2>
            <GenericForm endpoint="/api/transport/maintenance" title="Nouvel entretien" triggerLabel="Entretien" triggerVariant="outline" fields={[
              { name: "vehicleId", label: "Véhicule", type: "select", required: true, options: vehicleOptions }, { name: "type", label: "Type" }, { name: "cout", label: "Coût (CDF)", type: "number" }, { name: "prochainKm", label: "Prochain (km)", type: "number" }, { name: "date", label: "Date", type: "date" },
            ]} />
          </div>
          <div className="divide-y divide-slate-50">
            {entretiens.map((m) => (<div key={m.maintenance.id} className="flex items-center justify-between px-5 py-2.5"><div><p className="text-sm font-semibold text-slate-800">{m.maintenance.type ?? "Entretien"} — {m.vehicles?.plaque ?? "—"}</p><p className="text-xs text-slate-400">{m.maintenance.prochainKm ? `Prochain ${formatNombre(m.maintenance.prochainKm, 0)} km` : formatDate(m.maintenance.date)}</p></div><p className="font-display text-sm font-bold text-slate-900">{formatMontant(toNum(m.maintenance.cout), "CDF")}</p></div>))}
            {entretiens.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun entretien.</p>}
          </div>
        </Card>
      </div>

      {/* Documents */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-slate-900"><FileText size={15} className="mb-0.5 mr-1 inline text-marine" />Documents &amp; assurances {docsAlerte > 0 && <span className="ml-1 rounded-full bg-danger px-2 py-0.5 text-[11px] text-white">{docsAlerte} à renouveler</span>}</h2>
          <GenericForm endpoint="/api/transport/documents" title="Nouveau document" triggerLabel="Document" triggerVariant="outline" fields={[
            { name: "vehicleId", label: "Véhicule", type: "select", required: true, options: vehicleOptions },
            { name: "type", label: "Type", type: "select", options: [{ value: "assurance", label: "Assurance" }, { value: "visite technique", label: "Visite technique" }, { value: "carte grise", label: "Carte grise" }, { value: "licence", label: "Licence" }, { value: "autre", label: "Autre" }] },
            { name: "numero", label: "Numéro" }, { name: "dateEmission", label: "Émission", type: "date" }, { name: "dateExpiration", label: "Expiration", type: "date" },
          ]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead><tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400"><th className="px-5 py-2.5 font-semibold">Véhicule</th><th className="px-5 py-2.5 font-semibold">Type</th><th className="px-5 py-2.5 font-semibold">Expiration</th><th className="px-5 py-2.5 font-semibold">Statut</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {docs.map((d) => {
                const st = statutDoc(d.vehicle_document.dateExpiration);
                return (
                  <tr key={d.vehicle_document.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-900">{d.vehicles?.plaque ?? "—"}</td>
                    <td className="px-5 py-3 capitalize text-slate-600">{d.vehicle_document.type}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(d.vehicle_document.dateExpiration)}</td>
                    <td className="px-5 py-3">{st === "expire" ? <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-0.5 text-xs font-semibold text-danger"><AlertTriangle size={11} /> Expiré</span> : st === "bientot" ? <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"><AlertTriangle size={11} /> À renouveler</span> : <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"><ShieldCheck size={11} /> Valide</span>}</td>
                  </tr>
                );
              })}
              {docs.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Aucun document.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Trajets & chauffeurs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900"><Route size={15} className="mb-0.5 mr-1 inline text-marine" />Trajets récents</div>
          <div className="divide-y divide-slate-50">
            {trajets.map((t) => (<div key={t.trips.id} className="flex items-center gap-3 px-5 py-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-marine/10 text-marine"><Truck size={16} /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{t.trips.origine} → {t.trips.destination}</p><p className="text-xs text-slate-400">{t.trips.client} · {t.vehicles?.plaque ?? "—"}</p></div><p className="font-display text-sm font-bold text-emerald-600">{formatMontant(toNum(t.trips.revenu), "CDF")}</p></div>))}
            {trajets.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun trajet.</p>}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Chauffeurs</div>
          <div className="divide-y divide-slate-50">
            {chauffeurs.map((c) => (<div key={c.id} className="flex items-center gap-3 px-5 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-ciel/10 text-sm font-bold text-ciel">{c.nom.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{c.nom}</p><p className="text-xs text-slate-400">{c.telephone}</p></div></div>))}
            {chauffeurs.length === 0 && <p className="px-5 py-6 text-center text-sm text-slate-400">Aucun chauffeur.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
