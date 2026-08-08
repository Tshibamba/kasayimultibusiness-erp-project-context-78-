import { Phone, Mail, MapPin, User } from "lucide-react";
import { Card, EmptyState } from "@/components/agriculture/ui";
import { FournisseurDialog } from "@/components/agriculture/fournisseur-dialog";
import { db } from "@/db";
import { fournisseur } from "@/db/schema";
import { asc } from "drizzle-orm";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FournisseursPage() {
  let items: typeof fournisseur.$inferSelect[] = [];
  try {
    items = await db.select().from(fournisseur).orderBy(asc(fournisseur.nom));
  } catch {
    /* ignore */
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Achats</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
            Fournisseurs d'intrants
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vos partenaires d'approvisionnement en semences, engrais et produits phytosanitaires.
          </p>
        </div>
        <FournisseurDialog />
      </div>

      {items.length === 0 ? (
        <EmptyState
          emoji="🚚"
          title="Aucun fournisseur"
          description="Ajoutez vos fournisseurs pour les associer aux bons de commande d'intrants."
          action={<FournisseurDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((f) => (
            <Card key={f.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marine/10 font-display text-base font-bold text-marine">
                  {f.nom.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-bold text-slate-900">
                    {f.nom}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Partenaire depuis {formatDate(f.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {f.contact && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <User size={14} className="text-slate-400" /> {f.contact}
                  </p>
                )}
                {f.telephone && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" /> {f.telephone}
                  </p>
                )}
                {f.email && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <Mail size={14} className="text-slate-400" /> {f.email}
                  </p>
                )}
                {f.adresse && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <MapPin size={14} className="text-slate-400" /> {f.adresse}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
