// ─────────────────────────────────────────────────────────────
// Rôles & Permissions — KasayiMultiBusiness ERP
// Référence : cahier des charges §4 (Architecture des rôles)
// ─────────────────────────────────────────────────────────────

export type RoleId =
  | "super_admin"
  | "directeur"
  | "responsable"
  | "comptable"
  | "caissier"
  | "saisie"
  | "auditeur";

export const ROLES: {
  id: RoleId;
  label: string;
  description: string;
  couleur: string;
}[] = [
  { id: "super_admin", label: "Super Administrateur", description: "Propriétaire — accès total à tous les modules, utilisateurs, paramètres et sauvegardes.", couleur: "bg-marine text-white" },
  { id: "directeur", label: "Directeur Général", description: "Tableau de bord global, rapports de toutes les activités, validation des opérations importantes.", couleur: "bg-or text-white" },
  { id: "responsable", label: "Responsable d'activité", description: "Accès complet à son module uniquement : saisie, modification, rapports.", couleur: "bg-ciel text-white" },
  { id: "comptable", label: "Comptable", description: "Module comptabilité (écritures, impôts, rapports financiers). Lecture sur les modules opérationnels.", couleur: "bg-succes text-white" },
  { id: "caissier", label: "Caissier", description: "Trésorerie — sa caisse uniquement. Encaissements / décaissements et rapport journalier.", couleur: "bg-ciel-clair text-marine" },
  { id: "saisie", label: "Agent de saisie", description: "Saisie uniquement (ni modification ni suppression). Accès limité à son module.", couleur: "bg-slate-200 text-slate-700" },
  { id: "auditeur", label: "Auditeur", description: "Lecture seule sur tous les modules, rapports et journal d'audit. Aucune modification.", couleur: "bg-slate-300 text-slate-800" },
];

export type ModuleId =
  | "dashboard" | "admin" | "agriculture" | "transport" | "sous_traitance"
  | "traiteur" | "commerce" | "rh" | "comptabilite" | "rapports";

export const MODULES: { id: ModuleId; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "admin", label: "Administration" },
  { id: "agriculture", label: "Agriculture" },
  { id: "transport", label: "Transport" },
  { id: "sous_traitance", label: "Sous-traitance" },
  { id: "traiteur", label: "Service traiteur" },
  { id: "commerce", label: "Commerce général" },
  { id: "rh", label: "Ressources humaines" },
  { id: "comptabilite", label: "Comptabilité / Trésorerie" },
  { id: "rapports", label: "Rapports" },
];

export type ActionId = "voir" | "creer" | "modifier" | "supprimer" | "valider" | "exporter";

export const ACTIONS: { id: ActionId; label: string }[] = [
  { id: "voir", label: "Voir" },
  { id: "creer", label: "Créer" },
  { id: "modifier", label: "Modifier" },
  { id: "supprimer", label: "Supprimer" },
  { id: "valider", label: "Valider" },
  { id: "exporter", label: "Exporter" },
];

const TOUTES: ActionId[] = ["voir", "creer", "modifier", "supprimer", "valider", "exporter"];
const LECTURE: ActionId[] = ["voir", "exporter"];

// Matrice des permissions par rôle (module -> actions autorisées)
export const PERMISSIONS_PAR_ROLE: Record<RoleId, Partial<Record<ModuleId, ActionId[]>>> = {
  super_admin: Object.fromEntries(MODULES.map((m) => [m.id, TOUTES])) as Record<ModuleId, ActionId[]>,
  directeur: Object.fromEntries(
    MODULES.map((m) => [m.id, m.id === "admin" ? ["voir"] : ["voir", "valider", "exporter"]])
  ) as Record<ModuleId, ActionId[]>,
  responsable: { agriculture: TOUTES, transport: TOUTES, commerce: TOUTES, dashboard: ["voir"] },
  comptable: {
    comptabilite: TOUTES,
    agriculture: LECTURE,
    transport: LECTURE,
    commerce: LECTURE,
    rh: LECTURE,
    rapports: TOUTES,
    dashboard: ["voir"],
  },
  caissier: { comptabilite: ["voir", "creer"], dashboard: ["voir"] },
  saisie: { agriculture: ["voir", "creer"], commerce: ["voir", "creer"] },
  auditeur: Object.fromEntries(MODULES.map((m) => [m.id, LECTURE])) as Record<ModuleId, ActionId[]>,
};

export function peut(role: RoleId, module: ModuleId, action: ActionId): boolean {
  return (PERMISSIONS_PAR_ROLE[role]?.[module] ?? []).includes(action);
}

export function permissionsRole(role: RoleId): { module: ModuleId; actions: ActionId[] }[] {
  const map = PERMISSIONS_PAR_ROLE[role] ?? {};
  return MODULES.filter((m) => map[m.id]).map((m) => ({
    module: m.id,
    actions: map[m.id]!,
  }));
}
