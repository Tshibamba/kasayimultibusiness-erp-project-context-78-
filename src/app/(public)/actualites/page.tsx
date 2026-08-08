import Link from "next/link";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SectionHeading } from "@/components/public/section-heading";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Actualités" };

export default async function ActualitesPage() {
  const items = await db
    .select()
    .from(articles)
    .where(eq(articles.isPublished, true))
    .orderBy(desc(articles.publishedAt));

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-or">Actualités</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-5xl">
            Les news de KasayiMultiBusiness
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-500">
            Suivez nos campagnes, nos nouveautés et les coulisses de nos cinq métiers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        {items.length === 0 ? (
          <p className="py-16 text-center text-slate-400">Aucun article pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <Link
                key={a.id}
                href={`/actualites/${a.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image ?? ""} alt={a.titre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {a.categorie && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-marine shadow">
                      <Tag size={11} /> {a.categorie}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays size={12} /> {formatDate(a.publishedAt)}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-bold leading-snug text-slate-900 group-hover:text-marine">
                    {a.titre}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">{a.extrait}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ciel group-hover:text-marine">
                    Lire l'article <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
