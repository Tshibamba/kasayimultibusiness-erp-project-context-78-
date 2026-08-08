import {
  pgTable,
  serial,
  text,
  timestamp,
  numeric,
  integer,
  varchar,
  pgEnum,
  boolean,
  jsonb,
  primaryKey,
  date,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────
// Énumérations
// ─────────────────────────────────────────────────────────────

export const categorieIntrant = pgEnum("categorie_intrant", [
  "SEMENCE", "ENGRAIS", "PESTICIDE", "HERBICIDE", "FONGICIDE",
  "INSECTICIDE", "OUTIL", "CARBURANT", "AUTRE",
]);
export const typeMouvement = pgEnum("type_mouvement", ["ENTREE", "SORTIE", "AJUSTEMENT"]);
export const statutStock = pgEnum("statut_stock", ["RUPTURE", "CRITIQUE", "FAIBLE", "OK", "SURSTOCK"]);
export const niveauAlerte = pgEnum("niveau_alerte", ["INFO", "WARNING", "DANGER", "CRITIQUE"]);
export const typeAlerte = pgEnum("type_alerte", ["STOCK_FAIBLE", "STOCK_CRITIQUE", "RUPTURE", "SURSTOCK", "PEREMPTION"]);
export const statutAlerte = pgEnum("statut_alerte", ["ACTIVE", "ACQUITTEE", "RESOLUE"]);

export const typeContrat = pgEnum("type_contrat", ["CDI", "CDD", "JOURNALIER", "PRESTATAIRE"]);
export const statutEmploye = pgEnum("statut_employe", ["ACTIF", "CONGE", "SUSPENDU", "INACTIF"]);
export const typeCompte = pgEnum("type_compte", ["CAISSE", "BANQUE"]);
export const typeTransaction = pgEnum("type_transaction", ["ENTREE", "SORTIE"]);
export const statutFacture = pgEnum("statut_facture", ["BROUILLON", "VALIDEE", "PAYEE", "PARTIELLEMENT", "IMPAYEE"]);

// ─────────────────────────────────────────────────────────────
// ADMINISTRATION
// ─────────────────────────────────────────────────────────────

export const roles = pgTable("roles", {
  id: varchar("id", { length: 40 }).primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  description: text("description"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  module: varchar("module", { length: 40 }).notNull(),
  action: varchar("action", { length: 40 }).notNull(),
  description: varchar("description", { length: 200 }),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: varchar("role_id", { length: 40 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.roleId, t.permissionId] }) })
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: text("password_hash"),
  roleId: varchar("role_id", { length: 40 }).references(() => roles.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 30 }),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull().default("KasayiMultiBusiness"),
  slogan: varchar("slogan", { length: 200 }),
  adresse: varchar("adresse", { length: 250 }),
  ville: varchar("ville", { length: 100 }),
  telephone: varchar("telephone", { length: 30 }),
  email: varchar("email", { length: 150 }),
  nif: varchar("nif", { length: 50 }),
  rc: varchar("rc", { length: 50 }),
  rccm: varchar("rccm", { length: 50 }),
  devisePrincipale: varchar("devise_principale", { length: 10 }).notNull().default("CDF"),
  tvaTaux: numeric("tva_taux", { precision: 5, scale: 2 }).notNull().default("16"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  location: varchar("location", { length: 200 }),
  telephone: varchar("telephone", { length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: varchar("action", { length: 50 }).notNull(),
  module: varchar("module", { length: 40 }).notNull(),
  table: varchar("table", { length: 60 }),
  recordId: varchar("record_id", { length: 60 }),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// COMMUN
// ─────────────────────────────────────────────────────────────

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  devise: varchar("devise", { length: 10 }).notNull(),
  rate: numeric("rate", { precision: 18, scale: 4 }).notNull(),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  setBy: varchar("set_by", { length: 150 }),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: varchar("title", { length: 150 }).notNull(),
  message: text("message"),
  type: varchar("type", { length: 40 }),
  link: varchar("link", { length: 200 }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  email: varchar("email", { length: 150 }),
  adresse: text("adresse"),
  type: varchar("type", { length: 20 }).notNull().default("particulier"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessage = pgTable("contact_message", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  sujet: varchar("sujet", { length: 200 }),
  activite: varchar("activite", { length: 60 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// AGRICULTURE
// ─────────────────────────────────────────────────────────────

export const fournisseur = pgTable("fournisseur", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  email: varchar("email", { length: 150 }),
  adresse: text("adresse"),
  contact: varchar("contact", { length: 150 }),
  typeSemence: varchar("type_semence", { length: 100 }),
  conditionsPaiement: varchar("conditions_paiement", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const produitIntrant = pgTable("produit_intrant", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 200 }).notNull(),
  categorie: categorieIntrant("categorie").notNull().default("AUTRE"),
  unite: varchar("unite", { length: 20 }).notNull().default("kg"),
  description: text("description"),
  seuilAlerte: numeric("seuil_alerte", { precision: 12, scale: 2 }).notNull().default("0"),
  seuilCritique: numeric("seuil_critique", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stockIntrant = pgTable("stock_intrant", {
  id: serial("id").primaryKey(),
  produitId: integer("produit_id").notNull().references(() => produitIntrant.id, { onDelete: "cascade" }),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull().default("0"),
  cmup: numeric("cmup", { precision: 14, scale: 4 }).notNull().default("0"),
  valeurStock: numeric("valeur_stock", { precision: 16, scale: 2 }).notNull().default("0"),
  statut: statutStock("statut").notNull().default("OK"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mouvementStock = pgTable("mouvement_stock", {
  id: serial("id").primaryKey(),
  produitId: integer("produit_id").notNull().references(() => produitIntrant.id, { onDelete: "cascade" }),
  type: typeMouvement("type").notNull(),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull(),
  prixAchat: numeric("prix_achat", { precision: 14, scale: 4 }),
  motif: varchar("motif", { length: 200 }),
  reference: varchar("reference", { length: 100 }),
  modePaiement: varchar("mode_paiement", { length: 40 }),
  fournisseurId: integer("fournisseur_id").references(() => fournisseur.id, { onDelete: "set null" }),
  quantiteAvant: numeric("quantite_avant", { precision: 14, scale: 2 }).notNull(),
  quantiteApres: numeric("quantite_apres", { precision: 14, scale: 2 }).notNull(),
  cmupAvant: numeric("cmup_avant", { precision: 14, scale: 4 }).notNull(),
  cmupApres: numeric("cmup_apres", { precision: 14, scale: 4 }).notNull(),
  valeur: numeric("valeur", { precision: 16, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const alerteStock = pgTable("alerte_stock", {
  id: serial("id").primaryKey(),
  produitId: integer("produit_id").notNull().references(() => produitIntrant.id, { onDelete: "cascade" }),
  niveau: niveauAlerte("niveau").notNull(),
  type: typeAlerte("type").notNull(),
  message: text("message").notNull(),
  statut: statutAlerte("statut").notNull().default("ACTIVE"),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull().default("0"),
  seuil: numeric("seuil", { precision: 12, scale: 2 }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────
// RESSOURCES HUMAINES
// ─────────────────────────────────────────────────────────────

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  matricule: varchar("matricule", { length: 30 }),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  nom: varchar("nom", { length: 100 }).notNull(),
  genre: varchar("genre", { length: 10 }),
  dateNaissance: date("date_naissance"),
  lieuNaissance: varchar("lieu_naissance", { length: 150 }),
  situationFamiliale: varchar("situation_familiale", { length: 30 }),
  nbEnfants: integer("nb_enfants").notNull().default(0),
  telephone: varchar("telephone", { length: 30 }),
  email: varchar("email", { length: 150 }),
  adresse: text("adresse"),
  cin: varchar("cin", { length: 30 }),
  photoUrl: varchar("photo_url", { length: 300 }),
  dateEmbauche: date("date_embauche"),
  typeContrat: typeContrat("type_contrat").notNull().default("CDI"),
  departement: varchar("departement", { length: 80 }),
  poste: varchar("poste", { length: 100 }),
  grade: varchar("grade", { length: 80 }),
  salaireBase: numeric("salaire_base", { precision: 14, scale: 2 }).notNull().default("0"),
  statut: statutEmploye("statut").notNull().default("ACTIF"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const employeeDocument = pgTable("employee_document", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull().default("autre"),
  nomFichier: varchar("nom_fichier", { length: 200 }),
  url: text("url"),
  dateAjout: timestamp("date_ajout", { withTimezone: true }).defaultNow().notNull(),
});

export const employeeHistory = pgTable("employee_history", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull(),
  description: text("description").notNull(),
  date: date("date"),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  checkIn: varchar("check_in", { length: 10 }),
  checkOut: varchar("check_out", { length: 10 }),
  statut: varchar("statut", { length: 20 }).notNull().default("present"),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull(),
  dateDebut: date("date_debut").notNull(),
  dateFin: date("date_fin").notNull(),
  jours: numeric("jours", { precision: 6, scale: 1 }).notNull().default("1"),
  statut: varchar("statut", { length: 20 }).notNull().default("pending"),
  approuvePar: varchar("approuve_par", { length: 150 }),
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  mois: integer("mois").notNull(),
  annee: integer("annee").notNull(),
  salaireBase: numeric("salaire_base", { precision: 14, scale: 2 }).notNull().default("0"),
  heuresSup: numeric("heures_sup", { precision: 14, scale: 2 }).notNull().default("0"),
  primes: numeric("primes", { precision: 14, scale: 2 }).notNull().default("0"),
  deductions: numeric("deductions", { precision: 14, scale: 2 }).notNull().default("0"),
  cnss: numeric("cnss", { precision: 14, scale: 2 }).notNull().default("0"),
  ipr: numeric("ipr", { precision: 14, scale: 2 }).notNull().default("0"),
  salaireNet: numeric("salaire_net", { precision: 14, scale: 2 }).notNull().default("0"),
  datePaiement: timestamp("date_paiement", { withTimezone: true }),
  statut: varchar("statut", { length: 20 }).notNull().default("brouillon"),
});

// ─────────────────────────────────────────────────────────────
// COMPTABILITÉ / TRÉSORERIE
// ─────────────────────────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 120 }).notNull(),
  type: typeCompte("type").notNull().default("CAISSE"),
  solde: numeric("solde", { precision: 16, scale: 2 }).notNull().default("0"),
  devise: varchar("devise", { length: 10 }).notNull().default("CDF"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  type: typeTransaction("type").notNull(),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull(),
  description: text("description"),
  module: varchar("module", { length: 40 }),
  reference: varchar("reference", { length: 100 }),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  toAccountId: integer("to_account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
});

export const receivables = pgTable("receivables", {
  id: serial("id").primaryKey(),
  client: varchar("client", { length: 150 }).notNull(),
  module: varchar("module", { length: 40 }),
  reference: varchar("reference", { length: 100 }),
  montantTotal: numeric("montant_total", { precision: 16, scale: 2 }).notNull().default("0"),
  montantPaye: numeric("montant_paye", { precision: 16, scale: 2 }).notNull().default("0"),
  reste: numeric("reste", { precision: 16, scale: 2 }).notNull().default("0"),
  echeance: date("echeance"),
  statut: statutFacture("statut").notNull().default("IMPAYEE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const payables = pgTable("payables", {
  id: serial("id").primaryKey(),
  fournisseur: varchar("fournisseur", { length: 150 }).notNull(),
  module: varchar("module", { length: 40 }),
  reference: varchar("reference", { length: 100 }),
  montantTotal: numeric("montant_total", { precision: 16, scale: 2 }).notNull().default("0"),
  montantPaye: numeric("montant_paye", { precision: 16, scale: 2 }).notNull().default("0"),
  reste: numeric("reste", { precision: 16, scale: 2 }).notNull().default("0"),
  echeance: date("echeance"),
  statut: statutFacture("statut").notNull().default("IMPAYEE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// COMMERCE GÉNÉRAL
// ─────────────────────────────────────────────────────────────

export const commerceProducts = pgTable("commerce_products", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 200 }).notNull(),
  categorie: varchar("categorie", { length: 80 }),
  unite: varchar("unite", { length: 20 }).notNull().default("pièce"),
  prixAchat: numeric("prix_achat", { precision: 14, scale: 2 }).notNull().default("0"),
  prixVente: numeric("prix_vente", { precision: 14, scale: 2 }).notNull().default("0"),
  stockMin: numeric("stock_min", { precision: 12, scale: 2 }).notNull().default("0"),
  stock: numeric("stock", { precision: 14, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  client: varchar("client", { length: 150 }),
  reference: varchar("reference", { length: 100 }),
  totalHT: numeric("total_ht", { precision: 16, scale: 2 }).notNull().default("0"),
  taxe: numeric("taxe", { precision: 16, scale: 2 }).notNull().default("0"),
  totalTTC: numeric("total_ttc", { precision: 16, scale: 2 }).notNull().default("0"),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  statut: statutFacture("statut").notNull().default("BROUILLON"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  designation: varchar("designation", { length: 200 }).notNull(),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull(),
  prixUnitaire: numeric("prix_unitaire", { precision: 14, scale: 2 }).notNull(),
  total: numeric("total", { precision: 16, scale: 2 }).notNull(),
});

// ─────────────────────────────────────────────────────────────
// TRANSPORT
// ─────────────────────────────────────────────────────────────

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plaque: varchar("plaque", { length: 30 }).notNull(),
  marque: varchar("marque", { length: 80 }),
  modele: varchar("modele", { length: 80 }),
  type: varchar("type", { length: 60 }),
  capacite: varchar("capacite", { length: 40 }),
  statut: varchar("statut", { length: 20 }).notNull().default("actif"),
  dateAchat: date("date_achat"),
  annee: integer("annee"),
  coutAchat: numeric("cout_achat", { precision: 16, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  numeroPermis: varchar("numero_permis", { length: 50 }),
  permisExpiration: date("permis_expiration"),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  driverId: integer("driver_id").references(() => drivers.id, { onDelete: "set null" }),
  client: varchar("client", { length: 150 }),
  origine: varchar("origine", { length: 120 }),
  destination: varchar("destination", { length: 120 }),
  dateDepart: timestamp("date_depart", { withTimezone: true }),
  dateRetour: timestamp("date_retour", { withTimezone: true }),
  kilometrage: integer("kilometrage"),
  revenu: numeric("revenu", { precision: 16, scale: 2 }).notNull().default("0"),
  statut: varchar("statut", { length: 20 }).notNull().default("planifie"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// SOUS-TRAITANCE
// ─────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 200 }).notNull(),
  type: varchar("type", { length: 80 }),
  client: varchar("client", { length: 150 }),
  localisation: varchar("localisation", { length: 200 }),
  dateDebut: date("date_debut"),
  dateFin: date("date_fin"),
  budget: numeric("budget", { precision: 16, scale: 2 }).notNull().default("0"),
  avancement: numeric("avancement", { precision: 5, scale: 2 }).notNull().default("0"),
  statut: varchar("statut", { length: 20 }).notNull().default("encours"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// SERVICE TRAITEUR
// ─────────────────────────────────────────────────────────────

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  nomClient: varchar("nom_client", { length: 150 }).notNull(),
  typeEvenement: varchar("type_evenement", { length: 80 }),
  dateEvenement: timestamp("date_evenement", { withTimezone: true }),
  lieu: varchar("lieu", { length: 200 }),
  nbInvites: integer("nb_invites"),
  montantTotal: numeric("montant_total", { precision: 16, scale: 2 }).notNull().default("0"),
  statut: varchar("statut", { length: 20 }).notNull().default("planifie"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// ESPACE CLIENT PUBLIC (inscription, demande de service, newsletter)
// ─────────────────────────────────────────────────────────────

export const clientAccounts = pgTable("client_accounts", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  telephone: varchar("telephone", { length: 30 }),
  entreprise: varchar("entreprise", { length: 150 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  clientAccountId: integer("client_account_id").references(() => clientAccounts.id, { onDelete: "set null" }),
  nom: varchar("nom", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  activite: varchar("activite", { length: 60 }),
  description: text("description").notNull(),
  statut: varchar("statut", { length: 20 }).notNull().default("nouveau"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  source: varchar("source", { length: 60 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// ARTICLES / ACTUALITÉS (site public)
// ─────────────────────────────────────────────────────────────

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  titre: varchar("titre", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  extrait: text("extrait").notNull(),
  contenu: text("contenu").notNull(),
  image: text("image"),
  auteur: varchar("auteur", { length: 150 }).notNull().default("Direction KasayiMultiBusiness"),
  categorie: varchar("categorie", { length: 60 }),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// SERVICES (les 5 métiers — menu & contenu pilotés par le backend)
// ─────────────────────────────────────────────────────────────

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  nom: varchar("nom", { length: 120 }).notNull(),
  emoji: varchar("emoji", { length: 10 }),
  accroche: varchar("accroche", { length: 120 }),
  description: text("description"),
  image: text("image"),
  points: jsonb("points"),
  ordre: integer("ordre").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// FAQ / AIDE
// ─────────────────────────────────────────────────────────────

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 250 }).notNull(),
  reponse: text("reponse").notNull(),
  categorie: varchar("categorie", { length: 60 }),
  ordre: integer("ordre").notNull().default(0),
});

// ─────────────────────────────────────────────────────────────
// AGRICULTURE — Chaîne de production (parcelles, cultures, traitements, récoltes, ventes)
// ─────────────────────────────────────────────────────────────

export const parcelle = pgTable("parcelle", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  localisation: varchar("localisation", { length: 200 }),
  surface: numeric("surface", { precision: 12, scale: 2 }).notNull().default("0"),
  uniteSurface: varchar("unite_surface", { length: 10 }).notNull().default("ha"),
  statut: varchar("statut", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const culture = pgTable("culture", {
  id: serial("id").primaryKey(),
  parcelleId: integer("parcelle_id").notNull().references(() => parcelle.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 150 }).notNull(),
  variete: varchar("variete", { length: 100 }),
  dateSemis: date("date_semis"),
  dateRecoltePrevue: date("date_recolte_prevue"),
  superficie: numeric("superficie", { precision: 12, scale: 2 }).notNull().default("0"),
  mainOeuvre: numeric("main_oeuvre", { precision: 14, scale: 2 }).notNull().default("0"),
  statut: varchar("statut", { length: 20 }).notNull().default("en_cours"),
  responsable: varchar("responsable", { length: 150 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const traitementCulture = pgTable("traitement_culture", {
  id: serial("id").primaryKey(),
  cultureId: integer("culture_id").notNull().references(() => culture.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 60 }),
  produit: varchar("produit", { length: 150 }),
  quantite: numeric("quantite", { precision: 12, scale: 2 }).notNull().default("0"),
  unite: varchar("unite", { length: 20 }),
  cout: numeric("cout", { precision: 14, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recolte = pgTable("recolte", {
  id: serial("id").primaryKey(),
  cultureId: integer("culture_id").notNull().references(() => culture.id, { onDelete: "cascade" }),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull().default("0"),
  unite: varchar("unite", { length: 20 }),
  qualite: varchar("qualite", { length: 40 }),
  pertes: numeric("pertes", { precision: 14, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const venteAgricole = pgTable("vente_agricole", {
  id: serial("id").primaryKey(),
  cultureId: integer("culture_id").notNull().references(() => culture.id, { onDelete: "cascade" }),
  produit: varchar("produit", { length: 150 }),
  client: varchar("client", { length: 150 }),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull().default("0"),
  unite: varchar("unite", { length: 20 }),
  prixUnitaire: numeric("prix_unitaire", { precision: 14, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  montantPaye: numeric("montant_paye", { precision: 16, scale: 2 }).notNull().default("0"),
  statutPaiement: varchar("statut_paiement", { length: 20 }).notNull().default("non_paye"),
  datePaiement: date("date_paiement"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// TRANSPORT — carburant, entretien, documents
// ─────────────────────────────────────────────────────────────

export const fuelRecord = pgTable("fuel_record", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  date: date("date"),
  litres: numeric("litres", { precision: 10, scale: 2 }).notNull().default("0"),
  cout: numeric("cout", { precision: 14, scale: 2 }).notNull().default("0"),
  odometer: integer("odometer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  date: date("date"),
  type: varchar("type", { length: 60 }),
  description: text("description"),
  cout: numeric("cout", { precision: 14, scale: 2 }).notNull().default("0"),
  prochainKm: integer("prochain_km"),
  prochaineDate: date("prochaine_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vehicleDocument = pgTable("vehicle_document", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull().default("assurance"),
  numero: varchar("numero", { length: 80 }),
  dateEmission: date("date_emission"),
  dateExpiration: date("date_expiration"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// TRANSPORT — locations, péages, autres dépenses
// ─────────────────────────────────────────────────────────────

export const vehicleRental = pgTable("vehicle_rental", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 150 }).notNull(),
  proprietaire: varchar("proprietaire", { length: 150 }),
  coutLocation: numeric("cout_location", { precision: 14, scale: 2 }).notNull().default("0"),
  dateDebut: date("date_debut"),
  dateFin: date("date_fin"),
  statut: varchar("statut", { length: 20 }).notNull().default("en_cours"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const toll = pgTable("toll", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id, { onDelete: "set null" }),
  lieu: varchar("lieu", { length: 120 }),
  cout: numeric("cout", { precision: 14, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const transportExpense = pgTable("transport_expense", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  type: varchar("type", { length: 60 }),
  description: text("description"),
  montant: numeric("montant", { precision: 14, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// SOUS-TRAITANCE — contrats, équipes, matériaux, dépenses, factures, paiements
// ─────────────────────────────────────────────────────────────

export const projectProgress = pgTable("project_progress", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  avancement: numeric("avancement", { precision: 5, scale: 2 }).notNull().default("0"),
  date: date("date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subContract = pgTable("sub_contract", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  reference: varchar("reference", { length: 60 }),
  objet: varchar("objet", { length: 200 }),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull().default("0"),
  dateSignature: date("date_signature"),
  dateDebut: date("date_debut"),
  dateFin: date("date_fin"),
  statut: varchar("statut", { length: 20 }).notNull().default("signe"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectTeam = pgTable("project_team", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 150 }).notNull(),
  role: varchar("role", { length: 100 }),
  coutMainOeuvre: numeric("cout_main_oeuvre", { precision: 14, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectMaterial = pgTable("project_material", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  designation: varchar("designation", { length: 150 }).notNull(),
  quantite: numeric("quantite", { precision: 12, scale: 2 }).notNull().default("0"),
  unite: varchar("unite", { length: 20 }),
  coutUnitaire: numeric("cout_unitaire", { precision: 14, scale: 2 }).notNull().default("0"),
  fournisseur: varchar("fournisseur", { length: 150 }),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectExpense = pgTable("project_expense", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 60 }),
  description: text("description"),
  montant: numeric("montant", { precision: 14, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectInvoice = pgTable("project_invoice", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 60 }),
  montantHT: numeric("montant_ht", { precision: 16, scale: 2 }).notNull().default("0"),
  taxe: numeric("taxe", { precision: 16, scale: 2 }).notNull().default("0"),
  totalTTC: numeric("total_ttc", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  echeance: date("echeance"),
  statut: varchar("statut", { length: 20 }).notNull().default("emise"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectPayment = pgTable("project_payment", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  methode: varchar("methode", { length: 40 }),
  reference: varchar("reference", { length: 80 }),
  statut: varchar("statut", { length: 20 }).notNull().default("recu"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// SERVICE TRAITEUR — commandes, menus, stock alimentaire, personnel, dépenses, factures
// ─────────────────────────────────────────────────────────────

export const cateringOrder = pgTable("catering_order", {
  id: serial("id").primaryKey(),
  client: varchar("client", { length: 150 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  dateSouhaitee: date("date_souhaitee"),
  nbPersonnes: integer("nb_personnes"),
  description: text("description"),
  statut: varchar("statut", { length: 20 }).notNull().default("nouvelle"),
  eventId: integer("event_id").references(() => events.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const menu = pgTable("menu", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  description: text("description"),
  prixParPersonne: numeric("prix_par_personne", { precision: 14, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringIngredient = pgTable("catering_ingredient", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 150 }).notNull(),
  unite: varchar("unite", { length: 20 }),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull().default("0"),
  prixAchat: numeric("prix_achat", { precision: 14, scale: 2 }).notNull().default("0"),
  seuilAlerte: numeric("seuil_alerte", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringPurchase = pgTable("catering_purchase", {
  id: serial("id").primaryKey(),
  ingredientId: integer("ingredient_id").notNull().references(() => cateringIngredient.id, { onDelete: "cascade" }),
  quantite: numeric("quantite", { precision: 14, scale: 2 }).notNull().default("0"),
  prixAchat: numeric("prix_achat", { precision: 14, scale: 2 }).notNull().default("0"),
  fournisseur: varchar("fournisseur", { length: 150 }),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringStaff = pgTable("catering_staff", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 150 }).notNull(),
  role: varchar("role", { length: 100 }),
  cout: numeric("cout", { precision: 14, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringExpense = pgTable("catering_expense", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 60 }),
  description: text("description"),
  montant: numeric("montant", { precision: 14, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cateringInvoice = pgTable("catering_invoice", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 60 }),
  montantHT: numeric("montant_ht", { precision: 16, scale: 2 }).notNull().default("0"),
  taxe: numeric("taxe", { precision: 16, scale: 2 }).notNull().default("0"),
  totalTTC: numeric("total_ttc", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  statut: varchar("statut", { length: 20 }).notNull().default("emise"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// COMMERCE — achats (dépenses d'approvisionnement)
// ─────────────────────────────────────────────────────────────

export const commercePurchase = pgTable("commerce_purchase", {
  id: serial("id").primaryKey(),
  fournisseur: varchar("fournisseur", { length: 150 }),
  reference: varchar("reference", { length: 80 }),
  total: numeric("total", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// IMPÔTS & TAXES (BF20)
// ─────────────────────────────────────────────────────────────

export const taxPayment = pgTable("tax_payment", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 40 }).notNull(),
  periode: varchar("periode", { length: 20 }),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull().default("0"),
  datePaiement: date("date_paiement"),
  echeance: date("echeance"),
  reference: varchar("reference", { length: 80 }),
  statut: varchar("statut", { length: 20 }).notNull().default("a_payer"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// HISTORIQUE DES CONNEXIONS (BF02)
// ─────────────────────────────────────────────────────────────

export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: varchar("email", { length: 150 }),
  success: boolean("success").notNull().default(true),
  reason: varchar("reason", { length: 150 }),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// GESTION FINANCIÈRE TRANSVERSALE (BF18/BF19) — dépenses & recettes centralisées
// ─────────────────────────────────────────────────────────────

export const depense = pgTable("depense", {
  id: serial("id").primaryKey(),
  nature: varchar("nature", { length: 100 }).notNull(),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  activite: varchar("activite", { length: 40 }).notNull().default("general"),
  categorie: varchar("categorie", { length: 60 }),
  responsable: varchar("responsable", { length: 150 }),
  modePaiement: varchar("mode_paiement", { length: 40 }),
  justificatif: varchar("justificatif", { length: 200 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const recette = pgTable("recette", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 100 }).notNull(),
  description: varchar("description", { length: 200 }),
  montant: numeric("montant", { precision: 16, scale: 2 }).notNull().default("0"),
  date: date("date"),
  activite: varchar("activite", { length: 40 }).notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// IA — Conversations, Messages, Paramètres
// ─────────────────────────────────────────────────────────────

export const aiConversation = pgTable("ai_conversation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userRole: varchar("user_role", { length: 40 }),
  userName: varchar("user_name", { length: 150 }),
  title: varchar("title", { length: 200 }).notNull().default("Nouvelle conversation"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiMessage = pgTable("ai_message", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => aiConversation.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  provider: varchar("provider", { length: 40 }),
  tokensUsed: integer("tokens_used"),
  latencyMs: integer("latency_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiSetting = pgTable("ai_setting", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 200 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// Type helpers
// ─────────────────────────────────────────────────────────────

export type CategorieIntrant = (typeof categorieIntrant.enumValues)[number];
export type TypeMouvement = (typeof typeMouvement.enumValues)[number];
export type StatutStock = (typeof statutStock.enumValues)[number];
export type NiveauAlerte = (typeof niveauAlerte.enumValues)[number];
export type TypeAlerte = (typeof typeAlerte.enumValues)[number];
export type StatutAlerte = (typeof statutAlerte.enumValues)[number];
export type TypeContrat = (typeof typeContrat.enumValues)[number];
