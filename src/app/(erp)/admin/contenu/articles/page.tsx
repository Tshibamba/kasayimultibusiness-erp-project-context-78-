import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { DeleteButton, TogglePublishButton } from "@/components/erp/row-actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const items = await db.select().from(articles).orderBy(desc(articles.publishedAt));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Contenu · Actualités</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Articles du site</h1>
        </div>
        <GenericForm
          endpoint="/api/admin/articles"
          title="Nouvel article"
          triggerLabel="Nouvel article"
          fields={[
            { name: "titre", label: "Titre", required: true },
            { name: "categorie", label: "Catégorie", placeholder: "Agriculture, Transport..." },
            { name: "auteur", label: "Auteur" },
            { name: "image", label: "URL de l'image" },
            { name: "extrait", label: "Extrait (résumé court)", type: "textarea" },
            { name: "contenu", label: "Contenu (séparez les paragraphes par une ligne vide)", type: "textarea" },
          ]}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Article</th>
                <th className="px-5 py-3 font-semibold">Catégorie</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Visibilité</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <p className="line-clamp-1 font-semibold text-slate-900">{a.titre}</p>
                    <p className="font-mono text-xs text-slate-400">/actualites/{a.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{a.categorie ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(a.publishedAt)}</td>
                  <td className="px-5 py-3.5">
                    <TogglePublishButton endpoint={`/api/admin/articles/${a.id}`} published={a.isPublished} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DeleteButton endpoint={`/api/admin/articles/${a.id}`} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Aucun article.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
