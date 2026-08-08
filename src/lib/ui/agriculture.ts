import type {
  CategorieIntrant,
  StatutStock,
  NiveauAlerte,
  TypeMouvement,
} from "@/db/schema";

// ─────────────────────────────────────────────────────────────
// Catégories d'intrants
// ─────────────────────────────────────────────────────────────

export const CATEGORIES: { value: CategorieIntrant; label: string; emoji: string }[] = [
  { value: "SEMENCE", label: "Semence", emoji: "🌱" },
  { value: "ENGRAIS", label: "Engrais", emoji: "🧪" },
  { value: "PESTICIDE", label: "Pesticide", emoji: "🛡️" },
  { value: "HERBICIDE", label: "Herbicide", emoji: "🌿" },
  { value: "FONGICIDE", label: "Fongicide", emoji: "🍄" },
  { value: "INSECTICIDE", label: "Insecticide", emoji: "🐛" },
  { value: "OUTIL", label: "Outil / Matériel", emoji: "🛠️" },
  { value: "CARBURANT", label: "Carburant", emoji: "⛽" },
  { value: "AUTRE", label: "Autre", emoji: "📦" },
];

export const categorieLabel = (c: string) =>
  CATEGORIES.find((x) => x.value === c)?.label ?? c;
export const categorieEmoji = (c: string) =>
  CATEGORIES.find((x) => x.value === c)?.emoji ?? "📦";

export const UNITES = ["kg", "g", "L", "mL", "sac", "sac 50kg", "litre", "pièce", "bote", "tonne"];

// ─────────────────────────────────────────────────────────────
// Statut de stock → couleurs & libellés
// ─────────────────────────────────────────────────────────────

export const STATUT_STOCK: Record<
  StatutStock,
  { label: string; classes: string; dot: string; ring: string }
> = {
  OK: {
    label: "En stock",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  FAIBLE: {
    label: "Stock faible",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
  CRITIQUE: {
    label: "Stock critique",
    classes: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    ring: "ring-orange-500/30",
  },
  RUPTURE: {
    label: "Rupture",
    classes: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
    ring: "ring-red-500/30",
  },
  SURSTOCK: {
    label: "Surstock",
    classes: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
    ring: "ring-sky-500/30",
  },
};

// ─────────────────────────────────────────────────────────────
// Niveau d'alerte → couleurs & libellés
// ─────────────────────────────────────────────────────────────

export const NIVEAU_ALERTE: Record<
  NiveauAlerte,
  { label: string; classes: string; bar: string; icon: string }
> = {
  INFO: {
    label: "Information",
    classes: "bg-sky-50 text-sky-700 border-sky-200",
    bar: "bg-sky-500",
    icon: "ℹ️",
  },
  WARNING: {
    label: "Avertissement",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
    icon: "⚠️",
  },
  DANGER: {
    label: "Danger",
    classes: "bg-orange-50 text-orange-700 border-orange-200",
    bar: "bg-orange-500",
    icon: "🟠",
  },
  CRITIQUE: {
    label: "Critique",
    classes: "bg-red-50 text-red-700 border-red-200",
    bar: "bg-red-500",
    icon: "🚨",
  },
};

// ─────────────────────────────────────────────────────────────
// Types de mouvement
// ─────────────────────────────────────────────────────────────

export const TYPE_MOUVEMENT: Record<
  TypeMouvement,
  { label: string; classes: string; sign: string }
> = {
  ENTREE: {
    label: "Entrée",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    sign: "+",
  },
  SORTIE: {
    label: "Sortie",
    classes: "bg-red-50 text-red-700 border-red-200",
    sign: "−",
  },
  AJUSTEMENT: {
    label: "Ajustement",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
    sign: "±",
  },
};

// ─────────────────────────────────────────────────────────────
// Couleurs de marque (référence — voir globals.css @theme)
// ─────────────────────────────────────────────────────────────

export const MARQUE = {
  marine: "#1B4F72",
  ciel: "#2E86AB",
  or: "#F0A500",
  succes: "#27AE60",
  danger: "#E74C3C",
};

// Palette pour graphiques Recharts
export const PALETTE_GRAPH = ["#1B4F72", "#2E86AB", "#F0A500", "#27AE60", "#E74C3C", "#8E44AD"];
