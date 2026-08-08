import type { ReactNode } from "react";
import {
  STATUT_STOCK,
  NIVEAU_ALERTE,
  TYPE_MOUVEMENT,
  categorieLabel,
  categorieEmoji,
} from "@/lib/ui/agriculture";
import type { StatutStock, NiveauAlerte, TypeMouvement } from "@/db/schema";

// ── Carte ───────────────────────────────────────────────
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

// ── Badge générique ─────────────────────────────────────
export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function StatutStockBadge({ statut }: { statut: StatutStock }) {
  const s = STATUT_STOCK[statut];
  return (
    <Badge className={s.classes}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </Badge>
  );
}

export function NiveauAlerteBadge({ niveau }: { niveau: NiveauAlerte }) {
  const n = NIVEAU_ALERTE[niveau];
  return <Badge className={n.classes}>{n.label}</Badge>;
}

export function TypeMouvementBadge({ type }: { type: TypeMouvement }) {
  const t = TYPE_MOUVEMENT[type];
  return <Badge className={t.classes}>{t.label}</Badge>;
}

export function CategorieChip({ categorie }: { categorie: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      <span>{categorieEmoji(categorie)}</span>
      {categorieLabel(categorie)}
    </span>
  );
}

// ── Bouton ──────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "gold" | "ghost" | "danger" | "outline";
const BTN: Record<BtnVariant, string> = {
  primary: "bg-marine text-white hover:bg-marine-clair shadow-sm",
  secondary: "bg-ciel text-white hover:bg-ciel-clair shadow-sm",
  gold: "bg-or text-white hover:brightness-95 shadow-sm",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-danger text-white hover:brightness-95 shadow-sm",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: {
  children: ReactNode;
  variant?: BtnVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${BTN[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Champs de formulaire ────────────────────────────────
export function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

const INPUT_BASE =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-ciel focus:ring-2 focus:ring-ciel/25";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT_BASE} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${INPUT_BASE} ${props.className ?? ""}`} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea {...props} className={`${INPUT_BASE} ${props.className ?? ""}`} />
  );
}

// ── État vide ───────────────────────────────────────────
export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <h3 className="font-display text-lg font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Barre de progression stock ──────────────────────────
export function StockBar({
  quantite,
  seuilAlerte,
  seuilCritique,
  unite,
}: {
  quantite: number;
  seuilAlerte: number;
  seuilCritique: number;
  unite: string;
}) {
  const max = Math.max(quantite, seuilAlerte, seuilCritique, 1) * 1.2;
  const pct = Math.min(100, (quantite / max) * 100);
  const critPct = Math.min(100, (seuilCritique / max) * 100);
  const alertPct = Math.min(100, (seuilAlerte / max) * 100);

  const color =
    quantite <= 0
      ? "bg-danger"
      : seuilCritique > 0 && quantite <= seuilCritique
        ? "bg-orange-500"
        : seuilAlerte > 0 && quantite <= seuilAlerte
          ? "bg-amber-500"
          : "bg-succes";

  return (
    <div className="w-full">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        {alertPct > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-amber-400/80"
            style={{ left: `${alertPct}%` }}
            title={`Seuil d'alerte : ${seuilAlerte} ${unite}`}
          />
        )}
        {critPct > 0 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-red-500/80"
            style={{ left: `${critPct}%` }}
            title={`Seuil critique : ${seuilCritique} ${unite}`}
          />
        )}
      </div>
    </div>
  );
}
