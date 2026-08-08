"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Boxes, BellRing, Sprout, Truck, Users, ShieldCheck, Settings,
  Leaf, HardHat, UtensilsCrossed, ShoppingCart, UserCog, Calculator, FileBarChart,
  Database, PieChart, Landmark, Wallet, Image,
} from "lucide-react";
import { ROLES } from "@/lib/permissions";
import { StaffLogout } from "@/components/erp/staff-logout";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; badge?: boolean };

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Pilotage",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { href: "/finances", label: "Finances transversales", icon: Wallet },
      { href: "/bilan", label: "Bilan financier", icon: PieChart },
      { href: "/rapports", label: "Rapports", icon: FileBarChart },
    ],
  },
  {
    title: "Agriculture",
    items: [
      { href: "/agriculture/stocks", label: "Stocks intrants", icon: Boxes },
      { href: "/agriculture/achats", label: "Achats intrants", icon: ShoppingCart },
      { href: "/agriculture/stocks/alertes", label: "Alertes", icon: BellRing, badge: true },
      { href: "/agriculture/produits", label: "Produits", icon: Sprout },
      { href: "/agriculture/production", label: "Production", icon: Sprout },
      { href: "/agriculture/analyse", label: "Analyse rentabilité", icon: FileBarChart },
      { href: "/agriculture/fournisseurs", label: "Fournisseurs", icon: Truck },
    ],
  },
  {
    title: "Gestion",
    items: [
      { href: "/rh", label: "Ressources humaines", icon: UserCog },
      { href: "/commerce", label: "Commerce général", icon: ShoppingCart },
      { href: "/comptabilite", label: "Comptabilité / Trésorerie", icon: Calculator },
    ],
  },
  {
    title: "Travaux & services",
    items: [
      { href: "/transport", label: "Transport", icon: Truck },
      { href: "/sous-traitance", label: "Sous-traitance", icon: HardHat },
      { href: "/traiteur", label: "Service traiteur", icon: UtensilsCrossed },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Utilisateurs", icon: Users },
      { href: "/admin/roles", label: "Rôles & permissions", icon: ShieldCheck },
      { href: "/admin/systeme", label: "Backend / Système", icon: Database },
      { href: "/admin/taxes", label: "Impôts & taxes", icon: Landmark },
      { href: "/admin/medias", label: "Gestionnaire de médias", icon: Image },
      { href: "/admin/contenu", label: "Contenu du site", icon: FileBarChart },
      { href: "/admin/messages", label: "Messagerie", icon: BellRing },
      { href: "/admin/settings", label: "Paramètres entreprise", icon: Settings },
    ],
  },
];

export function AppShell({
  children,
  alertesActives = 0,
  staffName,
  staffRole,
}: {
  children: ReactNode;
  alertesActives?: number;
  staffName?: string | null;
  staffRole?: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const roleLabel = ROLES.find((r) => r.id === staffRole)?.label ?? "Agent";
  const initiales = (staffName ?? "Agent").split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-to-b from-marine to-[#163a59] text-slate-100 lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-or/90 text-white shadow-md"><Leaf size={22} /></div>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-bold text-white">KasayiMultiBusiness</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ciel-clair">ERP · Back-office</p>
          </div>
        </div>

        <nav className="mt-1 flex-1 overflow-y-auto px-3 pb-4">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white/15 text-white shadow-inner" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon size={18} className={active ? "text-or" : "text-ciel-clair"} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && alertesActives > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white animate-pulse-alert">{alertesActives}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <Link href="/" className="mb-3 block rounded-lg bg-white/5 px-3 py-2 text-center text-xs font-medium text-ciel-clair transition hover:bg-white/10">← Retour au site public</Link>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-ciel/40 text-sm font-bold text-white">{initiales}</div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-white">{staffName ?? "Agent"}</p>
              <p className="truncate text-[11px] text-slate-300">{roleLabel}</p>
            </div>
          </div>
          <Link href="/profil" className="mt-2 block rounded-lg bg-white/5 px-3 py-2 text-center text-xs font-medium text-ciel-clair transition hover:bg-white/10">Mon profil</Link>
          <StaffLogout />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-marine text-white"><Leaf size={16} /></div>
            <span className="font-display text-sm font-bold text-marine">KasayiMultiBusiness</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            {alertesActives > 0 && (
              <Link href="/agriculture/stocks/alertes" className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-danger ring-1 ring-red-200 hover:bg-red-100">
                <BellRing size={14} /> {alertesActives} alerte{alertesActives > 1 ? "s" : ""}
              </Link>
            )}
            <span className="hidden text-xs font-medium capitalize text-slate-400 sm:inline">
              {new Date().toLocaleDateString("fr-CD", { weekday: "long", day: "2-digit", month: "long", timeZone: "Africa/Lubumbashi" })}
            </span>
          </div>
        </div>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
