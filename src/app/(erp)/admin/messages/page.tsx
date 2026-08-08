import { Mail, FileInput, Users } from "lucide-react";
import { db } from "@/db";
import { contactMessage, serviceRequests, newsletterSubscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const [msgs, demandes, subs] = await Promise.all([
    db.select().from(contactMessage).orderBy(desc(contactMessage.createdAt)),
    db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt)),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)),
  ]).catch(() => [[], [], []]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm font-medium text-ciel">Communication</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Messagerie du site public</h1>
        <p className="mt-1 text-sm text-slate-500">Messages reçus des visiteurs, clients et abonnés.</p>
      </div>

      {/* Contact */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <Mail size={18} className="text-marine" /> Messages de contact <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{msgs.length}</span>
        </h2>
        <div className="space-y-2.5">
          {msgs.length === 0 ? (
            <Card className="p-6 text-center text-sm text-slate-400">Aucun message.</Card>
          ) : (
            msgs.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{m.nom} <span className="font-normal text-slate-400">· {m.email}</span></p>
                  <span className="text-xs text-slate-400">{formatDateTime(m.createdAt)}</span>
                </div>
                {m.activite && <p className="mt-1 text-xs font-semibold text-ciel">{m.activite}</p>}
                <p className="mt-1.5 text-sm text-slate-600">{m.message}</p>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Demandes de service */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <FileInput size={18} className="text-marine" /> Demandes de service clients <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{demandes.length}</span>
        </h2>
        <div className="space-y-2.5">
          {demandes.length === 0 ? (
            <Card className="p-6 text-center text-sm text-slate-400">Aucune demande.</Card>
          ) : (
            demandes.map((d) => (
              <Card key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{d.nom}</p>
                    <span className="rounded-lg bg-ciel/15 px-2 py-0.5 text-xs font-semibold text-ciel">{d.activite ?? "Service"}</span>
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{d.statut}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{d.description}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(d.createdAt)}</span>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <Users size={18} className="text-marine" /> Abonnés newsletter <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{subs.length}</span>
        </h2>
        <Card className="overflow-hidden">
          {subs.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">Aucun abonné.</div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
              {subs.map((s) => (
                <div key={s.id} className="bg-white p-3.5">
                  <p className="font-medium text-slate-800">{s.email}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(s.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
