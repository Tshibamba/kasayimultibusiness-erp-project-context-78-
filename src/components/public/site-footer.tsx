import Link from "next/link";
import { Leaf, MapPin, Phone, Mail, Send } from "lucide-react";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NewsletterForm } from "@/components/public/newsletter-form";

export async function SiteFooter() {
  let items: { slug: string; nom: string; emoji: string | null }[] = [];
  try {
    items = await db
      .select({ slug: services.slug, nom: services.nom, emoji: services.emoji })
      .from(services)
      .where(eq(services.isPublished, true))
      .orderBy(asc(services.ordre));
  } catch {
    items = [];
  }

  const annee = new Date().getFullYear();
  return (
    <footer className="bg-[#142a3f] text-slate-300">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center lg:flex-row lg:px-8 lg:text-left">
          <div className="max-w-md">
            <h4 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <Send size={18} className="text-or" /> Notre newsletter
            </h4>
            <p className="mt-1 text-sm text-slate-400">Recevez nos actualités, offres et conseils — un email par mois, sans spam.</p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm variant="dark" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-or text-white"><Leaf size={20} /></span>
            <span className="font-display text-lg font-bold text-white">KasayiMultiBusiness</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Entreprise multi-activités au KasaÃ¯ Central : agriculture, commerce, transport, sous-traitance et service traiteur.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Nos métiers</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((a) => (
              <li key={a.slug}>
                <Link href={`/activites#${a.slug}`} className="text-slate-400 transition hover:text-or">{a.emoji} {a.nom}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Navigation</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="text-slate-400 hover:text-or">Accueil</Link></li>
            <li><Link href="/actualites" className="text-slate-400 hover:text-or">Actualités</Link></li>
            <li><Link href="/equipe" className="text-slate-400 hover:text-or">Notre équipe</Link></li>
            <li><Link href="/flotte" className="text-slate-400 hover:text-or">Notre flotte</Link></li>
            <li><Link href="/a-propos" className="text-slate-400 hover:text-or">À propos</Link></li>
            <li><Link href="/aide" className="text-slate-400 hover:text-or">Aide</Link></li>
            <li><Link href="/login" className="text-slate-400 hover:text-or">Espace agent (s'inscrire)</Link></li>
            <li><Link href="/contact" className="text-slate-400 hover:text-or">Contact</Link></li>
            <li><Link href="/connexion" className="text-slate-400 hover:text-or">Espace client</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-or" /> Kasayi, Kananga — RD Congo</li>
            <li className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-or" /> +243 000 000 000</li>
            <li className="flex items-center gap-2"><Mail size={16} className="shrink-0 text-or" /> contact@kasayimultibusiness.cd</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row lg:px-8">
          <p>© {annee} KasayiMultiBusiness. Tous droits réservés.</p>
          <p>RD Congo · Conformité comptable SYSCOHADA</p>
        </div>
      </div>
    </footer>
  );
}
