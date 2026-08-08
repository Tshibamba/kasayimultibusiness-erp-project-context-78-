import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SectionHeading } from "@/components/public/section-heading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Notre équipe" };

export default async function EquipePage() {
  const team = await db
    .select({ id: employees.id, prenom: employees.prenom, nom: employees.nom, photoUrl: employees.photoUrl, poste: employees.poste, departement: employees.departement, grade: employees.grade })
    .from(employees)
    .where(eq(employees.statut, "ACTIF"));

  const parDepartement = team.reduce((acc, e) => {
    const dep = e.departement ?? "Général";
    if (!acc[dep]) acc[dep] = [];
    acc[dep].push(e);
    return acc;
  }, {} as Record<string, typeof team>);

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-br from-marine to-ciel py-14 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-or-clair">👥 Notre personnel</span>
          <h1 className="mt-4 font-display text-3xl font-bold lg:text-5xl">Notre équipe</h1>
          <p className="mt-3 max-w-2xl text-slate-200">Les hommes et les femmes qui font vivre KasayiMultiBusiness au quotidien, dans nos cinq activités.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        {Object.entries(parDepartement).map(([dep, membres]) => (
          <div key={dep} className="mb-12">
            <h2 className="mb-5 font-display text-xl font-bold text-marine">{dep}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {membres.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                  <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-marine/10 font-display text-2xl font-bold text-marine">
                    {m.photoUrl ? <img src={m.photoUrl} alt={`${m.prenom} ${m.nom}`} className="h-full w-full rounded-full object-cover" /> : `${m.prenom[0]}${m.nom[0]}`}
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">{m.prenom} {m.nom}</h3>
                  <p className="mt-1 text-sm font-medium text-ciel">{m.poste ?? "—"}</p>
                  {m.grade && <p className="mt-0.5 text-xs text-slate-400">{m.grade}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {team.length === 0 && <p className="py-16 text-center text-slate-400">Aucun membre d'équipe à afficher pour le moment.</p>}
      </section>
    </>
  );
}
