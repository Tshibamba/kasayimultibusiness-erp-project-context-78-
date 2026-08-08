import { redirect } from "next/navigation";
import { UserCircle2, ShieldCheck } from "lucide-react";
import { getCurrentStaff } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import { Card } from "@/components/agriculture/ui";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/login");
  const role = ROLES.find((r) => r.id === staff.roleId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-ciel">Mon compte</p>
        <h1 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Profil agent</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-marine/10 text-marine"><UserCircle2 size={30} /></span>
          <div>
            <p className="font-display text-lg font-bold text-slate-900">{staff.name}</p>
            <p className="text-sm text-slate-500">{staff.email}</p>
            {role && <span className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600"><ShieldCheck size={12} /> {role.label}</span>}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-slate-900">Changer le mot de passe</h2>
        <p className="mb-4 text-sm text-slate-500">Pour des raisons de sécurité, choisissez un mot de passe robuste (minimum 6 caractères).</p>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
