import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCircle2, PackageOpen } from "lucide-react";
import { LogoutButton } from "@/components/public/logout-button";
import { db } from "@/db";
import { serviceRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentClient } from "@/lib/auth";
import { ServiceRequestForm } from "@/components/public/service-request-form";
import { Card } from "@/components/agriculture/ui";
import { formatDate, formatHeureRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUT_STYLE: Record<string, string> = {
  nouveau: "bg-ciel/15 text-ciel",
  en_cours: "bg-amber-50 text-amber-700",
  traite: "bg-emerald-50 text-emerald-700",
  refuse: "bg-red-50 text-danger",
};

export default async function MonComptePage() {
  const client = await getCurrentClient();
  if (!client) redirect("/connexion");

  const demandes = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.clientAccountId, client.id))
    .orderBy(desc(serviceRequests.createdAt));

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-marine/10 text-marine">
            <UserCircle2 size={26} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Bonjour, {client.nom.split(" ")[0]}</h1>
            <p className="text-sm text-slate-500">{client.email}{client.entreprise ? ` · ${client.entreprise}` : ""}</p>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Demander un service</h2>
          <p className="mb-4 text-sm text-slate-500">Soumettez une demande pour l'une de nos activités.</p>
          <ServiceRequestForm defaultTelephone={client.telephone} />
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Mes demandes</h2>
          <p className="mb-4 text-sm text-slate-500">{demandes.length} demande{demandes.length > 1 ? "s" : ""}</p>
          {demandes.length === 0 ? (
            <div className="grid place-items-center rounded-2xl bg-slate-50 py-10 text-center">
              <PackageOpen size={32} className="text-slate-300" />
              <p className="mt-2 text-sm text-slate-400">Aucune demande pour l'instant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {demandes.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{d.activite ?? "Service"}</span>
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${STATUT_STYLE[d.statut] ?? "bg-slate-100 text-slate-500"}`}>
                      {d.statut.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-700">{d.description}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{formatDate(d.createdAt)} · {formatHeureRelative(d.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 text-center text-sm text-slate-400">
        <Link href="/" className="hover:text-marine">← Retour à l'accueil</Link>
      </div>
    </section>
  );
}
