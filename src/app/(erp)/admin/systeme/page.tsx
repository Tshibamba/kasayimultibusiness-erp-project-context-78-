import { Database, Table2, Activity, Server } from "lucide-react";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";

export const dynamic = "force-dynamic";

type TableInfo = { name: string; label: string; count: number };

const DOMAINS: { domain: string; emoji: string; tables: { name: string; label: string }[] }[] = [
  { domain: "Administration", emoji: "🔐", tables: [
    { name: "roles", label: "Rôles" }, { name: "users", label: "Utilisateurs" },
    { name: "permissions", label: "Permissions" }, { name: "company_settings", label: "Paramètres entreprise" },
    { name: "audit_logs", label: "Journal d'audit" },
  ] },
  { domain: "IA Assistant", emoji: "🤖", tables: [
    { name: "ai_conversation", label: "Conversations IA" }, { name: "ai_message", label: "Messages IA" }, { name: "ai_setting", label: "Paramètres IA" },
  ] },
  { domain: "Commun & Site public", emoji: "🌐", tables: [
    { name: "exchange_rates", label: "Taux de change" }, { name: "notifications", label: "Notifications" },
    { name: "client_accounts", label: "Comptes clients" }, { name: "contact_message", label: "Messages contact" },
    { name: "service_requests", label: "Demandes de service" }, { name: "newsletter_subscribers", label: "Abonnés newsletter" },
    { name: "articles", label: "Articles" }, { name: "services", label: "Services (site)" }, { name: "faqs", label: "FAQ" },
  ] },
  { domain: "Agriculture", emoji: "🌱", tables: [
    { name: "fournisseur", label: "Fournisseurs" }, { name: "produit_intrant", label: "Produits intrants" },
    { name: "stock_intrant", label: "Fiches de stock" }, { name: "mouvement_stock", label: "Mouvements de stock" },
    { name: "alerte_stock", label: "Alertes stock" }, { name: "parcelle", label: "Parcelles" },
    { name: "culture", label: "Cultures" }, { name: "traitement_culture", label: "Traitements" },
    { name: "recolte", label: "Récoltes" }, { name: "vente_agricole", label: "Ventes agricoles" },
  ] },
  { domain: "Ressources humaines", emoji: "👥", tables: [
    { name: "employees", label: "Employés" }, { name: "employee_document", label: "Documents employés" },
    { name: "employee_history", label: "Historique carrière" }, { name: "attendance", label: "Présences" },
    { name: "leaves", label: "Congés" }, { name: "payroll", label: "Bulletins de paie" },
  ] },
  { domain: "Comptabilité / Trésorerie", emoji: "💰", tables: [
    { name: "accounts", label: "Comptes (caisses/banques)" }, { name: "transactions", label: "Mouvements" },
    { name: "transfers", label: "Virements" }, { name: "receivables", label: "Créances" }, { name: "payables", label: "Dettes" },
    { name: "depense", label: "Dépenses centralisées (BF18)" }, { name: "recette", label: "Recettes centralisées (BF19)" },
  ] },
  { domain: "Commerce général", emoji: "🛒", tables: [
    { name: "commerce_products", label: "Articles" }, { name: "sales", label: "Ventes" }, { name: "sale_items", label: "Lignes de vente" },
    { name: "commerce_purchase", label: "Achats (dépenses)" },
  ] },
  { domain: "Transport", emoji: "🚚", tables: [
    { name: "vehicles", label: "Véhicules" }, { name: "drivers", label: "Chauffeurs" }, { name: "trips", label: "Trajets" },
    { name: "vehicle_rental", label: "Locations de camions" }, { name: "fuel_record", label: "Pleins carburant" },
    { name: "maintenance", label: "Entretiens" }, { name: "toll", label: "Péages" }, { name: "transport_expense", label: "Autres dépenses" },
    { name: "vehicle_document", label: "Documents véhicule" },
  ] },
  { domain: "Sous-traitance", emoji: "🏗️", tables: [
    { name: "projects", label: "Projets" }, { name: "sub_contract", label: "Contrats" }, { name: "project_progress", label: "Suivi avancement" },
    { name: "project_team", label: "Équipes" }, { name: "project_material", label: "Matériaux" }, { name: "project_expense", label: "Dépenses projet" },
    { name: "project_invoice", label: "Factures projet" }, { name: "project_payment", label: "Paiements projet" },
  ] },
  { domain: "Service traiteur", emoji: "🍽️", tables: [
    { name: "events", label: "Événements" }, { name: "catering_order", label: "Commandes" }, { name: "menu", label: "Menus" },
    { name: "catering_ingredient", label: "Stock alimentaire" }, { name: "catering_purchase", label: "Achats ingrédients" },
    { name: "catering_staff", label: "Personnel service" }, { name: "catering_expense", label: "Dépenses" }, { name: "catering_invoice", label: "Factures" },
  ] },
];

async function countRows(name: string): Promise<number> {
  try {
    const r = await db.execute(sql`SELECT count(*)::int as c FROM ${sql.identifier(name)}`);
    return Number((r.rows?.[0] as { c?: number })?.c ?? 0);
  } catch {
    return 0;
  }
}

export default async function SystemePage() {
  let dbOk = false;
  try {
    await db.execute(sql`select 1`);
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const domaines: { domain: string; emoji: string; tables: TableInfo[]; total: number }[] = [];
  let totalEnregistrements = 0;
  for (const d of DOMAINS) {
    const counts = await Promise.all(d.tables.map(async (t) => ({ ...t, count: await countRows(t.name) })));
    const total = counts.reduce((s, t) => s + t.count, 0);
    totalEnregistrements += total;
    domaines.push({ domain: d.domain, emoji: d.emoji, tables: counts, total });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Administration</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Explorateur du backend</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue technique du système : base de données (toutes les tables + enregistrements), état des services et cartographie des API.
        </p>
      </div>

      {/* État système */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Database} label="Base de données" value={dbOk ? "Connectée ✓" : "Hors-ligne"} tint={dbOk ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-danger"} />
        <Stat icon={Table2} label="Tables" value={`${DOMAINS.reduce((s, d) => s + d.tables.length, 0)}`} tint="bg-marine/10 text-marine" />
        <Stat icon={Activity} label="Enregistrements" value={totalEnregistrements.toLocaleString("fr-CD")} tint="bg-ciel/10 text-ciel" />
        <Stat icon={Server} label="Routes API" value="52" tint="bg-or/15 text-[#c08700]" />
      </div>

      {/* Tables par domaine */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {domaines.map((d) => (
          <Card key={d.domain} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h2 className="font-display text-sm font-bold text-slate-900">{d.emoji} {d.domain}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{d.total}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {d.tables.map((t) => (
                <div key={t.name} className="flex items-center justify-between px-5 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.label}</p>
                    <p className="font-mono text-[11px] text-slate-400">{t.name}</p>
                  </div>
                  <span className={`grid h-7 min-w-9 place-items-center rounded-lg px-2 font-display text-sm font-bold ${t.count > 0 ? "bg-marine/10 text-marine" : "bg-slate-100 text-slate-400"}`}>
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="font-display text-sm font-bold text-slate-900"><Server size={15} className="mb-0.5 mr-1 inline text-marine" />Cartographie des API (52 endpoints)</h2>
        <p className="mt-1 text-xs text-slate-500">Le backend = ces routes Next.js qui lisent/écrivent la base ci-dessus. Le frontend affiché consomme ces APIs.</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          {["Agriculture (12)", "Authentification (7)", "RH (2)", "Comptabilité (2)", "Commerce (3)", "Transport (1)", "Sous-traitance (1)", "Traiteur (1)", "Administration (7)", "Rapports (2)", "Contenu/Contact (5)", "Setup/Seed (5)"].map((g) => (
            <span key={g} className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">{g}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: typeof Database; label: string; value: string; tint: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 font-display text-xl font-bold text-slate-900">{value}</p></div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon size={20} /></div>
      </div>
    </Card>
  );
}
