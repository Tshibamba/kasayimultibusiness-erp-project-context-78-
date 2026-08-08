import Link from "next/link";
import { Sprout, Newspaper, MessageCircleQuestion, Inbox, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { services, articles, faqs, contactMessage, serviceRequests, newsletterSubscribers } from "@/db/schema";
import { Card } from "@/components/agriculture/ui";

export const dynamic = "force-dynamic";

export default async function ContenuHubPage() {
  const [srv, art, faq, msgs, demandes, subs] = await Promise.all([
    db.select().from(services),
    db.select().from(articles),
    db.select().from(faqs),
    db.select().from(contactMessage),
    db.select().from(serviceRequests),
    db.select().from(newsletterSubscribers),
  ]).catch(() => [[], [], [], [], [], []]);

  const cartes = [
    { titre: "Métiers (services)", count: srv.length, desc: "Les 5 activités affichées dans le menu et les pages", href: "/admin/contenu/services", icon: Sprout, tint: "bg-marine/10 text-marine" },
    { titre: "Articles / Actualités", count: art.length, desc: "Les actualités publiées sur le site", href: "/admin/contenu/articles", icon: Newspaper, tint: "bg-ciel/10 text-ciel" },
    { titre: "FAQ / Aide", count: faq.length, desc: "Les questions du centre d'aide", href: "/admin/contenu/faq", icon: MessageCircleQuestion, tint: "bg-or/15 text-[#c08700]" },
    { titre: "Messagerie", count: msgs.length + demandes.length, desc: "Messages contact, demandes clients & abonnés", href: "/admin/messages", icon: Inbox, tint: "bg-succes/10 text-succes" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Administration</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Contenu du site public</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les métiers, les actualités et la FAQ affichés sur le site. Les modifications sont immédiatement visibles par le public.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cartes.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card className="group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${c.tint}`}><Icon size={24} /></span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base font-bold text-slate-900">{c.titre}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{c.count}</span>
                  </div>
                  <p className="text-sm text-slate-500">{c.desc}</p>
                </div>
                <ArrowRight size={18} className="text-slate-300 transition group-hover:text-marine" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
