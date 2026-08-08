import { CheckCircle2, MapPin, Calendar, HardHat } from "lucide-react";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { SectionHeading } from "@/components/public/section-heading";
import { formatNombre, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nos réalisations" };

const TYPES = ["Construction", "Réhabilitation de routes", "Bâtiments", "Forages", "Autres travaux"];

export default async function RealisationsPage() {
  const items = await db
    .select({ id: projects.id, nom: projects.nom, type: projects.type, client: projects.client, localisation: projects.localisation, statut: projects.statut, avancement: projects.avancement, dateDebut: projects.dateDebut, dateFin: projects.dateFin })
    .from(projects)
    .orderBy(desc(projects.createdAt));

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-br from-marine to-ciel py-14 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-or-clair"><HardHat size={14} /> Nos travaux</span>
          <h1 className="mt-4 font-display text-3xl font-bold lg:text-5xl">Nos réalisations</h1>
          <p className="mt-3 max-w-2xl text-slate-200">Construction, réhabilitation de routes, bâtiments et forages : découvrez les projets que nous menons au KasaÃ¯ Central.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {["Tous", ...TYPES].map((t) => (
            <span key={t} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600">{t}</span>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="py-16 text-center text-slate-400">Aucune réalisation à afficher pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => {
              const av = Math.min(100, Number(p.avancement ?? 0));
              const termine = p.statut === "termine";
              return (
                <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-center justify-between bg-gradient-to-r from-marine to-[#1d5a82] px-5 py-4 text-white">
                    <span className="text-xs font-bold uppercase tracking-wide text-or-clair">{p.type ?? "Travaux"}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${termine ? "bg-emerald-400 text-white" : "bg-white/20 text-white"}`}>{termine ? "Terminé" : "En cours"}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-slate-900">{p.nom}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={13} /> {p.localisation ?? "—"}</p>
                    {p.client && <p className="mt-0.5 text-xs text-slate-400">Client : {p.client}</p>}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs"><span className="text-slate-400">Avancement</span><span className="font-bold text-slate-700">{formatNombre(av, 0)}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${av === 100 ? "bg-succes" : "bg-ciel"}`} style={{ width: `${av}%` }} /></div>
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400"><Calendar size={12} /> {formatDate(p.dateDebut)} → {formatDate(p.dateFin)}</p>
                    {termine && <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} /> Projet livré</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
