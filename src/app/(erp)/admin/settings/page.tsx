import { Card } from "@/components/agriculture/ui";
import { CompanyForm } from "./company-form";
import { db } from "@/db";
import { companySettings, exchangeRates } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatDate, toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings] = await db.select().from(companySettings).limit(1);
  const rates = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.date))
    .limit(10);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Administration</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
          Paramètres de l'entreprise
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Identité fiscale, coordonnées et configuration monétaire. Ces informations figurent sur les factures et rapports.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-slate-900">Identité & fiscalité</h2>
        <p className="mb-5 text-sm text-slate-500">
          NIF (Numéro d'Identification Fiscale), RC (Registre du Commerce) et RCCM sont requis pour la conformité SYSCOHADA.
        </p>
        <CompanyForm settings={settings} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-slate-900">Taux de change récents</h2>
        <p className="mb-4 text-sm text-slate-500">
          Devise de référence : <strong>CDF</strong>. Le dernier taux saisi est utilisé pour les conversions.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Devise</th>
                <th className="px-4 py-2.5 font-semibold">Taux (1 = X CDF)</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Saisi par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">Aucun taux enregistré.</td>
                </tr>
              ) : (
                rates.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{r.devise}</td>
                    <td className="px-4 py-2.5 text-slate-700">{toNum(r.rate).toLocaleString("fr-CD")}</td>
                    <td className="px-4 py-2.5 text-slate-500">{formatDate(r.date)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{r.setBy ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
