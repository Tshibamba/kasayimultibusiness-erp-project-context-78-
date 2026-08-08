"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Leaf, Menu, X, LayoutDashboard, UserCircle2, LogIn, ChevronDown, LifeBuoy } from "lucide-react";

type Service = { slug: string; nom: string; emoji: string | null; accroche: string | null };

const NAV = [
  { href: "/", label: "Accueil", exact: true },
  { href: "/realisations", label: "Réalisations" },
  { href: "/equipe", label: "Équipe" },
  { href: "/flotte", label: "Flotte" },
  { href: "/actualites", label: "Actualités" },
  { href: "/a-propos", label: "À propos" },
  { href: "/aide", label: "Aide", icon: LifeBuoy },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [client, setClient] = useState<{ nom: string } | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => setServices(d.items ?? []))
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setClient(d.client ?? null))
      .catch(() => setClient(null));
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-marine text-or">
            <Leaf size={20} />
          </span>
          <span className="font-display text-lg font-bold text-marine">
            Kasayi<span className="text-or">Multi</span>Business
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          <Link href="/" className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive("/", true) ? "bg-marine/5 text-marine" : "text-slate-600 hover:bg-slate-100 hover:text-marine"}`}>
            Accueil
          </Link>

          {/* Méga-menu Nos métiers */}
          <div className="group relative">
            <button className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive("/activites") ? "bg-marine/5 text-marine" : "text-slate-600 hover:bg-slate-100 hover:text-marine"}`}>
              Nos métiers <ChevronDown size={15} className="transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="w-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <div className="grid grid-cols-2 gap-1">
                  {services.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/activites#${s.slug}`}
                      className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-marine/5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">{s.emoji}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{s.nom}</span>
                        <span className="block text-xs text-slate-500">{s.accroche}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link href="/activites" className="mt-1 block rounded-xl bg-marine/5 px-3 py-2.5 text-center text-sm font-bold text-marine transition hover:bg-marine/10">
                  Voir toutes nos activités →
                </Link>
              </div>
            </div>
          </div>

          {NAV.filter((n) => n.href !== "/").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(item.href) ? "bg-marine/5 text-marine" : "text-slate-600 hover:bg-slate-100 hover:text-marine"}`}
            >
              {item.icon && <item.icon size={15} />}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={client ? "/mon-compte" : "/connexion"}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-marine"
          >
            {client ? <><UserCircle2 size={16} /> Mon compte</> : <><LogIn size={16} /> Connexion</>}
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-marine px-4 py-2 text-sm font-semibold text-white transition hover:bg-marine-clair">
            <LayoutDashboard size={16} /> Espace agent
          </Link>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-lg text-marine lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            <Link href="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">Accueil</Link>
            <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Nos métiers</p>
            {services.map((s) => (
              <Link key={s.slug} href={`/activites#${s.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600">
                <span>{s.emoji}</span> {s.nom}
              </Link>
            ))}
            {NAV.filter((n) => n.href !== "/").map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">
                {item.label}
              </Link>
            ))}
            <Link href={client ? "/mon-compte" : "/connexion"} onClick={() => setOpen(false)} className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">
              {client ? "Mon compte" : "Connexion / Inscription"}
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)} className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-marine px-4 py-2.5 text-sm font-semibold text-white">
              <LayoutDashboard size={16} /> Espace agent
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
