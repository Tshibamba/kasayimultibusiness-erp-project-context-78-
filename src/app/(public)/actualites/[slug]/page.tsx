import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Tag, User } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [a] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return { title: a?.titre ?? "Article" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
    .limit(1);

  if (!article) notFound();

  const autres = await db
    .select()
    .from(articles)
    .where(eq(articles.isPublished, true))
    .orderBy(desc(articles.publishedAt))
    .limit(3);

  const paragraphe = article.contenu.split("\n\n").filter(Boolean);

  return (
    <article>
      {/* Hero article */}
      <div className="relative h-[44vh] min-h-[320px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image ?? ""} alt={article.titre} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-marine/95 via-marine/60 to-marine/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-8 lg:px-8">
          {article.categorie && (
            <span className="inline-flex items-center gap-1 rounded-full bg-or px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <Tag size={11} /> {article.categorie}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl font-extrabold text-white lg:text-4xl">{article.titre}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-200">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(article.publishedAt)}</span>
            <span className="flex items-center gap-1.5"><User size={14} /> {article.auteur}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <Link href="/actualites" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ciel hover:text-marine">
          <ArrowLeft size={15} /> Toutes les actualités
        </Link>

        <div className="prose mt-6 max-w-none">
          <p className="font-display text-xl font-medium leading-relaxed text-slate-700">{article.extrait}</p>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-700">
            {paragraphe.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-r from-marine to-ciel p-6 text-center text-white">
          <p className="font-display text-lg font-bold">Une question sur cet article ?</p>
          <Link href="/contact" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-or px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95">
            Contactez-nous
          </Link>
        </div>
      </div>

      {/* À lire aussi */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <h2 className="mb-6 font-display text-xl font-bold text-slate-900">À lire aussi</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {autres
              .filter((a) => a.id !== article.id)
              .slice(0, 3)
              .map((a) => (
                <Link key={a.id} href={`/actualites/${a.slug}`} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image ?? ""} alt={a.titre} className="h-full w-full object-cover transition group-hover:scale-110" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{formatDate(a.publishedAt)}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-marine">{a.titre}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </article>
  );
}
