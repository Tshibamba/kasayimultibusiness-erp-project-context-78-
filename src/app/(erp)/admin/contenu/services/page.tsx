import { db } from "@/db";
import { services } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { DeleteButton, TogglePublishButton } from "@/components/erp/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const items = await db.select().from(services).orderBy(asc(services.ordre));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Contenu · Métiers</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Services affichés au public</h1>
        </div>
        <GenericForm
          endpoint="/api/admin/services"
          title="Nouveau métier"
          triggerLabel="Nouveau métier"
          fields={[
            { name: "nom", label: "Nom du métier", required: true },
            { name: "emoji", label: "Emoji", placeholder: "🌱" },
            { name: "accroche", label: "Accroche (courte)" },
            { name: "slug", label: "Slug (optionnel)", placeholder: "auto depuis le nom" },
            { name: "image", label: "URL de l'image" },
            { name: "ordre", label: "Ordre d'affichage", type: "number" },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Métier</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3 text-right font-semibold">Ordre</th>
                <th className="px-5 py-3 font-semibold">Visibilité</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <span className="mr-2 text-lg">{s.emoji}</span>
                    <span className="font-semibold text-slate-900">{s.nom}</span>
                    <p className="text-xs text-slate-400">{s.accroche}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{s.slug}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{s.ordre}</td>
                  <td className="px-5 py-3.5">
                    <TogglePublishButton endpoint={`/api/admin/services/${s.id}`} published={s.isPublished} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <DeleteButton endpoint={`/api/admin/services/${s.id}`} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Aucun métier.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
