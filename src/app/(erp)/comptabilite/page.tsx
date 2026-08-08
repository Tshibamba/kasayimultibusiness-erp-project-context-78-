import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { Wallet, Landmark, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { formatMontant, formatNombre, formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ComptabilitePage() {
  const comptes = await db.select().from(accounts).orderBy(asc(accounts.nom));
  const txs = await db
    .select()
    .from(transactions)
    .leftJoin(accounts, eq(accounts.id, transactions.accountId))
    .orderBy(desc(transactions.date))
    .limit(20);

  const treso = comptes.reduce((s, c) => s + toNum(c.solde), 0);
  const nbCaisses = comptes.filter((c) => c.type === "CAISSE").length;
  const nbBanques = comptes.filter((c) => c.type === "BANQUE").length;

  const stats = [
    { label: "Trésorerie totale", value: formatMontant(treso, "CDF"), icon: Wallet, tint: "bg-marine/10 text-marine" },
    { label: "Caisses", value: formatNombre(nbCaisses, 0), icon: Wallet, tint: "bg-ciel/10 text-ciel" },
    { label: "Comptes bancaires", value: formatNombre(nbBanques, 0), icon: Landmark, tint: "bg-or/15 text-[#c08700]" },
  ];

  const accountOptions = comptes.map((c) => ({ value: String(c.id), label: c.nom }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Finance</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Comptabilité &amp; Trésorerie</h1>
        </div>
        <GenericForm
          endpoint="/api/comptabilite/transactions"
          title="Nouveau mouvement"
          description="Entrée ou sortie de trésorerie (met à jour le solde)."
          triggerLabel="Nouveau mouvement"
          fields={[
            { name: "accountId", label: "Compte", type: "select", required: true, options: accountOptions },
            { name: "type", label: "Type", type: "select", required: true, options: [
              { value: "ENTREE", label: "Entrée (encaissement)" }, { value: "SORTIE", label: "Sortie (décaissement)" },
            ] },
            { name: "montant", label: "Montant (CDF)", type: "number", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "module", label: "Module concerné", placeholder: "agriculture, commerce..." },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3 p-5">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.tint}`}><Icon size={22} /></div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="font-display text-lg font-bold text-slate-900">{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Comptes</div>
          <div className="divide-y divide-slate-50">
            {comptes.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg ${c.type === "BANQUE" ? "bg-marine/10 text-marine" : "bg-ciel/10 text-ciel"}`}>
                    {c.type === "BANQUE" ? <Landmark size={16} /> : <Wallet size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.nom}</p>
                    <p className="text-xs text-slate-400">{c.type} · {c.devise}</p>
                  </div>
                </div>
                <p className="font-display text-sm font-bold text-slate-900">{formatMontant(toNum(c.solde), "CDF")}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Mouvements récents</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-2.5 font-semibold">Date</th>
                  <th className="px-5 py-2.5 font-semibold">Compte</th>
                  <th className="px-5 py-2.5 font-semibold">Libellé</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {txs.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Aucun mouvement.</td></tr>
                ) : txs.map((t) => (
                  <tr key={t.transactions.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(t.transactions.date)}</td>
                    <td className="px-5 py-3 text-slate-600">{t.accounts?.nom ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{t.transactions.description ?? "—"}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${t.transactions.type === "ENTREE" ? "text-emerald-600" : "text-danger"}`}>
                      {t.transactions.type === "ENTREE" ? <ArrowDownLeft size={13} className="mr-1 inline" /> : <ArrowUpRight size={13} className="mr-1 inline" />}
                      {formatMontant(toNum(t.transactions.montant), "CDF")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
