import Link from "next/link";
import { BellRing, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, EmptyState, NiveauAlerteBadge } from "@/components/agriculture/ui";
import { AlerteActions } from "@/components/agriculture/alerte-actions";
import { getAlertes } from "@/lib/agriculture/stock-service";
import { NIVEAU_ALERTE } from "@/lib/ui/agriculture";
import { formatNombre, formatHeureRelative, toNum } from "@/lib/format";
import type { NiveauAlerte } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AlertesPage({
  searchParams,
}: {
  searchParams: Promise<{ actives?: string }>;
}) {
  const { actives } = await searchParams;
  const activesOnly = actives !== "0";
  let alertes: Awaited<ReturnType<typeof getAlertes>> = [];
  let toutes: Awaited<ReturnType<typeof getAlertes>> = [];
  try {
    alertes = await getAlertes(activesOnly);
    toutes = await getAlertes(false);
  } catch {
    /* ignore */
  }

  const activesList = toutes.filter((a) => a.statut === "ACTIVE");
  const parNiveau = (["CRITIQUE", "DANGER", "WARNING", "INFO"] as NiveauAlerte[]).map(
    (n) => ({
      niveau: n,
      count: activesList.filter((a) => a.niveau === n).length,
    })
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Surveillance</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
            Centre d'alertes stock
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Alertes automatiques générées lors du franchissement des seuils.
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-medium">
          <Link
            href="/agriculture/stocks/alertes?actives=1"
            className={`rounded-lg px-3 py-1.5 ${activesOnly ? "bg-marine text-white" : "text-slate-500"}`}
          >
            Actives ({activesList.length})
          </Link>
          <Link
            href="/agriculture/stocks/alertes?actives=0"
            className={`rounded-lg px-3 py-1.5 ${!activesOnly ? "bg-marine text-white" : "text-slate-500"}`}
          >
            Historique
          </Link>
        </div>
      </div>

      {/* Répartition par niveau */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {parNiveau.map((p) => {
          const cfg = NIVEAU_ALERTE[p.niveau];
          return (
            <Card key={p.niveau} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{cfg.icon}</span>
                <span className="font-display text-2xl font-bold text-slate-900">
                  {p.count}
                </span>
              </div>
              <p className={`mt-2 text-sm font-semibold ${cfg.classes.split(" ").find((c) => c.startsWith("text-"))}`}>
                {cfg.label}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Liste */}
      {alertes.length === 0 ? (
        <EmptyState
          emoji="✅"
          title="Aucune alerte"
          description={
            activesOnly
              ? "Tous vos stocks sont au-dessus des seuils. Belle gestion !"
              : "Aucune alerte n'a encore été enregistrée."
          }
          action={
            activesOnly ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} /> Stocks sécurisés
              </span>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {alertes.map((a) => {
            const cfg = NIVEAU_ALERTE[a.niveau];
            const active = a.statut === "ACTIVE";
            return (
              <Card key={a.id} className={`overflow-hidden ${active ? "" : "opacity-75"}`}>
                <div className="flex">
                  <div className={`w-1.5 ${cfg.bar}`} />
                  <div className="flex flex-1 flex-wrap items-center gap-3 p-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">
                      {active ? <ShieldAlert size={20} className="text-danger" /> : <CheckCircle2 size={20} className="text-emerald-500" />}
                    </div>
                    <Link
                      href={`/agriculture/stocks/${a.produitId}`}
                      className="min-w-0 flex-1"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 hover:text-marine">
                          {a.nom}
                        </p>
                        <NiveauAlerteBadge niveau={a.niveau} />
                        <span className="text-xs text-slate-400">
                          · {formatHeureRelative(a.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{a.message}</p>
                    </Link>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-slate-900">
                        {formatNombre(toNum(a.quantite))}
                      </p>
                      <p className="text-xs text-slate-400">{a.unite} restant</p>
                    </div>
                    {active ? (
                      <AlerteActions alerteId={a.id} />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        {a.statut === "ACQUITTEE" ? "Acquittée" : "Résolue"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <BellRing size={13} /> Les alertes sont générées automatiquement à chaque mouvement
        de stock et lors des vérifications périodiques.
      </p>
    </div>
  );
}
