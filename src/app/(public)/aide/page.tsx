import Link from "next/link";
import { LifeBuoy, ArrowRight, MessageCircleQuestion } from "lucide-react";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SectionHeading } from "@/components/public/section-heading";

export const dynamic = "force-dynamic";

export const metadata = { title: "Aide & FAQ" };

export default async function AidePage() {
  const items = await db.select().from(faqs).orderBy(asc(faqs.ordre));
  const categories = Array.from(new Set(items.map((i) => i.categorie || "Général")));

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-br from-marine to-ciel py-14 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-or-clair">
            <LifeBuoy size={14} /> Centre d'aide
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold lg:text-5xl">Comment pouvons-nous vous aider ?</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Trouvez rapidement les réponses aux questions les plus fréquentes sur nos services et notre fonctionnement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-marine">
              <MessageCircleQuestion size={18} className="text-or" /> {cat}
            </h2>
            <div className="space-y-3">
              {items.filter((i) => (i.categorie || "Général") === cat).map((f) => (
                <details key={f.id} className="group rounded-2xl border border-slate-200 bg-white p-4 [&_summary]:cursor-pointer">
                  <summary className="flex items-center justify-between gap-3 font-semibold text-slate-800 marker:content-['']">
                    {f.question}
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.reponse}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-10 rounded-3xl bg-slate-50 p-8 text-center">
          <h3 className="font-display text-xl font-bold text-slate-900">Vous ne trouvez pas votre réponse ?</h3>
          <p className="mt-2 text-sm text-slate-500">Notre équipe est à votre écoute pour vous accompagner.</p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-or px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-95">
            Contactez-nous <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
