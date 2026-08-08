import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { SectionHeading } from "@/components/public/section-heading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nos activités" };

export default async function ActivitesPage() {
  const items = await db.select().from(services).where(eq(services.isPublished, true)).orderBy(asc(services.ordre));

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <SectionHeading
            center={false}
            eyebrow="Activités"
            title="Cinq métiers au service du KasaÃ¯ Central"
            subtitle="De la production agricole à la livraison, en passant par le commerce, les travaux et l'événementiel."
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-10 flex flex-wrap gap-2">
          {items.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-marine hover:text-white">
              {s.emoji} {s.nom}
            </a>
          ))}
        </div>

        <div className="space-y-20">
          {items.map((s, i) => {
            const points = (s.points as string[] | null) ?? [];
            return (
              <section key={s.slug} id={s.slug} className="scroll-mt-24">
                <div className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                  <div className="overflow-hidden rounded-3xl shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.image ?? ""} alt={s.nom} className="h-72 w-full object-cover lg:h-96" />
                  </div>
                  <div>
                    <span className="text-3xl">{s.emoji}</span>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-or">{s.accroche}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 lg:text-3xl">{s.nom}</h2>
                    <p className="mt-3 text-slate-600">{s.description}</p>
                    <ul className="mt-5 space-y-2.5">
                      {points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-succes/15 text-succes"><Check size={13} /></span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-marine px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-marine-clair">
                      Demander un devis <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
