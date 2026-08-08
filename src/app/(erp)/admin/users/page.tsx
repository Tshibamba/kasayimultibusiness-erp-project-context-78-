import { db } from "@/db";
import { users, roles, loginHistory } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { Card } from "@/components/agriculture/ui";
import { GenericForm } from "@/components/erp/generic-form";
import { UserActions } from "@/components/erp/user-actions";
import { ROLES } from "@/lib/permissions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [rows, historique] = await Promise.all([
    db.select({
      id: users.id, name: users.name, email: users.email, roleId: users.roleId,
      roleLabel: roles.label, isActive: users.isActive, failedAttempts: users.failedAttempts, lockedUntil: users.lockedUntil,
    }).from(users).leftJoin(roles, eq(roles.id, users.roleId)).orderBy(asc(users.name)),
    db.select().from(loginHistory).orderBy(desc(loginHistory.createdAt)).limit(15),
  ]);

  const roleOptions = ROLES.map((r) => ({ value: r.id, label: r.label }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ciel">Administration</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-500">Créer, activer/désactiver, réinitialiser un mot de passe et consulter l'historique.</p>
        </div>
        <GenericForm endpoint="/api/admin/users" title="Nouvel utilisateur" description="Le mot de passe pourra être changé par l'agent." triggerLabel="Nouvel utilisateur" fields={[
          { name: "name", label: "Nom complet", required: true },
          { name: "email", label: "Email", required: true },
          { name: "roleId", label: "Rôle", type: "select", options: roleOptions },
          { name: "password", label: "Mot de passe initial (≥ 6 car.)", required: true },
        ]} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold">Utilisateur</th>
                <th className="px-5 py-3 font-semibold">Rôle</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((u) => {
                const bloque = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                return (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-marine/10 text-xs font-bold text-marine">{u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{u.roleLabel ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      {!u.isActive ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Inactif</span>
                        : bloque ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger"><span className="h-1.5 w-1.5 rounded-full bg-danger" /> Bloqué</span>
                        : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Actif</span>}
                    </td>
                    <td className="px-5 py-3.5"><UserActions userId={u.id} isActive={u.isActive} /></td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Aucun utilisateur.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Historique des connexions */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 font-display text-sm font-bold text-slate-900">Historique des connexions (récent)</div>
        <div className="divide-y divide-slate-50">
          {historique.length === 0 ? <p className="px-5 py-8 text-center text-sm text-slate-400">Aucune connexion enregistrée.</p> : historique.map((h) => (
            <div key={h.id} className="flex items-center justify-between px-5 py-2.5">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${h.success ? "bg-emerald-500" : "bg-danger"}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{h.email ?? "—"}</p>
                  <p className="text-xs text-slate-400">{h.reason ?? (h.success ? "Connexion réussie" : "Échec")}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{formatDateTime(h.createdAt)} · {h.ip}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
