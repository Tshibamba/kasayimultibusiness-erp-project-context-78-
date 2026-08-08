import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Quote, Newspaper, Sparkles } from "lucide-react";
import { db } from "@/db";
import { articles, services } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { HeroSlider } from "@/components/public/hero-slider";
import { StatCounter } from "@/components/public/stat-counter";
import { SectionHeading } from "@/components/public/section-heading";
import { Testimonials } from "@/components/public/testimonials";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { STATS, SLIDES, TEMOIGNAGES, PARTENAIRES, GALERIE, AVANTAGES } from "@/lib/public/site-data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [dernieresActus, servicesList] = await Promise.all([
    db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt)).limit(3).catch(() => []),
    db.select().from(services).where(eq(services.isPublished, true)).orderBy(asc(services.ordre)).catch(() => []),
  ]);

  return (
    <>
      {/* Hero défilant */}
      <HeroSlider slides={SLIDES} />

      {/* Compteurs */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 lg:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <StatCounter key={s.label} value={s.valeur} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* Services en vedette (publicités) — backend */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Nos métiers"
          title="Cinq métiers à votre service"
          subtitle="Des solutions complètes et intégrées pour les particuliers, les entreprises et les institutions du KasaÃ¯ Central."
        />
        <div className="mt-12 space-y-6">
          {servicesList.map((a, idx) => {
            const points = (a.points as string[] | null) ?? [];
            return (
              <Link
                key={a.slug}
                href={`/activites#${a.slug}`}
                className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl lg:grid-cols-2"
              >
                <div className={`relative h-56 overflow-hidden lg:h-auto ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image ?? ""} alt={a.nom} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-2xl shadow">{a.emoji}</span>
                </div>
                <div className="flex flex-col justify-center p-6 lg:p-10">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-or/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#c08700]">
                    <Sparkles size={12} /> {a.accroche}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-bold text-slate-900 group-hover:text-marine">{a.nom}</h3>
                  <p className="mt-2 text-slate-500">{a.description}</p>
                  <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-succes" /> {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-ciel group-hover:text-marine">
                    En savoir plus <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Actualités */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading center={false} eyebrow="Actualités" title="Dernières news" />
            <Link href="/actualites" className="inline-flex items-center gap-1.5 rounded-xl bg-marine px-4 py-2 text-sm font-bold text-white transition hover:bg-marine-clair">
              <Newspaper size={15} /> Toutes les actualités
            </Link>
          </div>
          {dernieresActus.length === 0 ? (
            <p className="mt-10 text-center text-slate-400">Aucune actualité pour le moment.</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {dernieresActus.map((a) => (
                <Link key={a.id} href={`/actualites/${a.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image ?? ""} alt={a.titre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-400">{formatDate(a.publishedAt)}</p>
                    <h3 className="mt-1.5 line-clamp-2 font-display font-bold text-slate-900 group-hover:text-marine">{a.titre}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{a.extrait}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Galerie photos défilantes */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <SectionHeading eyebrow="En images" title="Notre univers en photos" subtitle="Faites glisser pour découvrir nos activités en action." />
        <div className="mt-10">
          <PhotoGallery photos={GALERIE} />
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="bg-marine py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading light eyebrow="Nos atouts" title="Pourquoi nous choisir ?" subtitle="Une entreprise locale, professionnelle et fiable." />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AVANTAGES.map((av) => (
              <div key={av.titre} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/10">
                <span className="text-3xl">{av.emoji}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-white">{av.titre}</h3>
                <p className="mt-2 text-sm text-slate-300">{av.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <SectionHeading eyebrow="Témoignages" title="Ils nous font confiance" />
        <div className="mt-10">
          <Testimonials items={TEMOIGNAGES} />
        </div>
      </section>

      {/* Partenaires */}
      <section className="border-y border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400">Ils nous accompagnent</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {PARTENAIRES.map((p) => (
              <span key={p} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Recrutement / Rejoignez l'équipe */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-marine/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-marine">👥 Carrières</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 lg:text-3xl">Rejoignez notre équipe</h2>
            <p className="mt-3 text-slate-500">Vous êtes agronome, comptable, chauffeur, cuisinier ou commercial ? KasayiMultiBusiness recrute dans tous ses départements. Inscrivez-vous dès maintenant pour créer votre compte agent.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["🌱 Agriculture", "🛒 Commerce", "🚚 Transport", "🏗️ Sous-traitance", "🍽️ Traiteur", "💰 Comptabilité"].map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{t}</span>
              ))}
            </div>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-marine px-6 py-3 text-sm font-bold text-white transition hover:bg-marine-clair">
              S'inscrire comme agent <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/equipe" className="text-center">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-marine/10 font-display text-2xl font-bold text-marine transition hover:scale-105">👥</div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Notre équipe</p>
            </Link>
            <Link href="/login" className="text-center">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-or/10 font-display text-2xl font-bold text-or transition hover:scale-105">📋</div>
              <p className="mt-2 text-xs font-semibold text-slate-500">S'inscrire</p>
            </Link>
            <Link href="/connexion" className="text-center">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-ciel/10 font-display text-2xl font-bold text-ciel transition hover:scale-105">👤</div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Espace client</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-marine to-ciel px-8 py-12 text-center text-white lg:px-16">
          <Quote size={32} className="mx-auto text-or" />
          <h2 className="mt-3 font-display text-2xl font-bold lg:text-3xl">Un projet ? Une demande de service ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-200">Créez votre espace client pour solliciter un devis, ou contactez-nous directement.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/connexion" className="inline-flex items-center gap-2 rounded-xl bg-or px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-95">
              Créer mon espace client <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
