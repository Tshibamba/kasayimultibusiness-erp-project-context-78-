import { db } from "@/db";
import { faqs } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { DeleteButton } from "@/components/erp/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const items = await db.select().from(faqs).orderBy(asc(faqs.ordre));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Contenu · Aide</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Questions fréquentes (FAQ)</h1>
        </div>
        <GenericForm
          endpoint="/api/admin/faqs"
          title="Nouvelle question"
          triggerLabel="Nouvelle question"
          fields={[
            { name: "question", label: "Question", required: true },
            { name: "categorie", label: "Catégorie", placeholder: "Général, Services..." },
            { name: "ordre", label: "Ordre", type: "number" },
            { name: "reponse", label: "Réponse", type: "textarea" },
          ]}
        />
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className="p-10 text-center text-slate-400">Aucune question pour le moment.</Card>
        ) : (
          items.map((f) => (
            <Card key={f.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{f.categorie}</span>
                </div>
                <h3 className="mt-1.5 font-semibold text-slate-900">{f.question}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.reponse}</p>
              </div>
              <DeleteButton endpoint={`/api/admin/faqs/${f.id}`} />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
