import { Image as ImageIcon, Leaf, FileText, Building } from "lucide-react";
import { db } from "@/db";
import { services, articles, companySettings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { MediaEditor } from "@/components/erp/media-editor";

export const dynamic = "force-dynamic";

export default async function MediasPage() {
  const [srv, art, settings] = await Promise.all([
    db.select({ id: services.id, nom: services.nom, emoji: services.emoji, image: services.image, slug: services.slug }).from(services).where(eq(services.isPublished, true)),
    db.select({ id: articles.id, titre: articles.titre, image: articles.image }).from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt)),
    db.select().from(companySettings).limit(1),
  ]);
  const logoUrl = settings[0]?.logoUrl ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Administration</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Gestionnaire de médias</h1>
        <p className="mt-1 text-sm text-slate-500">Modifiez n'importe quelle image du site (services, articles, logo). Collez une URL ou un chemin local <code className="rounded bg-slate-100 px-1">/images/...</code></p>
      </div>

      <div className="rounded-xl bg-ciel/5 border border-ciel/20 px-4 py-3 text-sm text-ciel">
        💡 <strong>Dossier local :</strong> <code>/public/images/</code> contient les sous-dossiers : <code>services/</code>, <code>articles/</code>, <code>slides/</code>, <code>logo/</code>, <code>equipe/</code>, <code>galerie/</code>. Déposez vos images dedans puis indiquez le chemin (ex: <code>/images/logo/logo.png</code>).
      </div>

      {/* Logo entreprise */}
      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-slate-900"><Building size={16} className="text-marine" />Logo de l'entreprise</h2>
        <MediaEditor type="logo" id="logo" label="Logo KasayiMultiBusiness" currentUrl={logoUrl} />
      </Card>

      {/* Images des services (métiers) */}
      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-slate-900"><Leaf size={16} className="text-marine" />Images des services (métiers) — {srv.length}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {srv.map((s) => (
            <MediaEditor key={s.id} type="service" id={s.id} label={`${s.emoji} ${s.nom}`} currentUrl={s.image} />
          ))}
        </div>
      </Card>

      {/* Images des articles */}
      <Card className="p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-slate-900"><FileText size={16} className="text-marine" />Images des articles — {art.length}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {art.map((a) => (
            <MediaEditor key={a.id} type="article" id={a.id} label={a.titre} currentUrl={a.image} />
          ))}
        </div>
        {art.length === 0 && <p className="text-sm text-slate-400">Aucun article.</p>}
      </Card>

      {/* Slides du carousel (explicatif) */}
      <Card className="p-5">
        <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-slate-900"><ImageIcon size={16} className="text-marine" />Images du carousel (slides)</h2>
        <p className="text-xs text-slate-400">Les 5 slides du carrousel d'accueil sont définis dans le fichier <code className="rounded bg-slate-100 px-1">src/lib/public/site-data.ts</code> → tableau <code>SLIDES</code>. Pour les personnaliser, modifiez les URLs <code>image:</code> dans ce fichier, ou placez vos images dans <code>/public/images/slides/</code>.</p>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><span>🌱</span> Slide 1 → <code>/images/slides/agriculture.jpg</code></div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><span>🚚</span> Slide 2 → <code>/images/slides/transport.jpg</code></div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><span>🍽️</span> Slide 3 → <code>/images/slides/traiteur.jpg</code></div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><span>🛒</span> Slide 4 → <code>/images/slides/commerce.jpg</code></div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><span>🏗️</span> Slide 5 → <code>/images/slides/sous-traitance.jpg</code></div>
        </div>
      </Card>
    </div>
  );
}
