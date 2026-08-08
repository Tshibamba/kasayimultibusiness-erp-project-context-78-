import { Check, X } from "lucide-react";
import { Card } from "@/components/agriculture/ui";
import {
  ROLES,
  MODULES,
  ACTIONS,
  PERMISSIONS_PAR_ROLE,
  type RoleId,
  type ModuleId,
} from "@/lib/permissions";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

function nbActions(role: RoleId, module: ModuleId): number {
  return (PERMISSIONS_PAR_ROLE[role]?.[module] ?? []).length;
}

export default async function RolesPage() {
  let countByRole: Record<string, number> = {};
  try {
    const all = await db.select({ roleId: users.roleId }).from(users);
    for (const u of all) {
      const r = u.roleId ?? "—";
      countByRole[r] = (countByRole[r] ?? 0) + 1;
    }
  } catch {
    /* ignore */
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Administration</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">
          Rôles &amp; permissions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Matrice de sécurité — chaque rôle dispose de droits précis par module et par action.
        </p>
      </div>

      {/* Cartes rôles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center justify-between">
              <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${r.couleur}`}>
                {r.label}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {countByRole[r.id] ?? 0} utilisateur{(countByRole[r.id] ?? 0) > 1 ? "s" : ""}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{r.description}</p>
          </Card>
        ))}
      </div>

      {/* Matrice */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">
            Matrice des permissions
          </h2>
          <p className="text-xs text-slate-500">
            Nombre d'actions autorisées par couple (module × rôle) — {ACTIONS.length} actions possibles :{" "}
            {ACTIONS.map((a) => a.label.toLowerCase()).join(", ")}.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-xs text-slate-500">
                <th className="sticky left-0 bg-slate-50/60 px-4 py-2.5 font-semibold text-slate-600">
                  Module
                </th>
                {ROLES.map((r) => (
                  <th key={r.id} className="px-2 py-2.5 text-center font-semibold" title={r.label}>
                    {r.label.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MODULES.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="sticky left-0 bg-white px-4 py-2.5 font-medium text-slate-700">
                    {m.label}
                  </td>
                  {ROLES.map((r) => {
                    const n = nbActions(r.id, m.id);
                    const plein = n === ACTIONS.length;
                    const aucun = n === 0;
                    return (
                      <td key={r.id} className="px-2 py-2.5 text-center">
                        {aucun ? (
                          <span className="inline-flex text-slate-300"><X size={14} /></span>
                        ) : (
                          <span
                            title={`${n}/${ACTIONS.length} actions`}
                            className={`inline-grid h-6 min-w-6 place-items-center rounded-md text-[11px] font-bold ${
                              plein ? "bg-emerald-100 text-emerald-700" : "bg-ciel/15 text-ciel"
                            }`}
                          >
                            {plein ? <Check size={13} /> : n}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
