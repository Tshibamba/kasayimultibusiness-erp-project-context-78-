import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  roles,
  permissions,
  rolePermissions,
  companySettings,
  exchangeRates,
  users,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import {
  ROLES,
  MODULES,
  ACTIONS,
  PERMISSIONS_PAR_ROLE,
} from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req?: NextRequest) {
  const reset = req ? new URL(req.url).searchParams.get("reset") === "1" : false;

  if (reset) {
    await db.execute(
      sql`TRUNCATE TABLE role_permissions, permissions, roles, users, company_settings, branches, audit_logs, exchange_rates, notifications RESTART IDENTITY CASCADE`
    );
  } else {
    const existing = await db.select().from(roles).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({
        alreadySeeded: true,
        message: "Fondations déjà initialisées. Ajoutez ?reset=1 pour réinitialiser.",
      });
    }
  }

  // 1. Rôles
  await db.insert(roles).values(
    ROLES.map((r) => ({
      id: r.id,
      label: r.label,
      description: r.description,
      isSystem: true,
    }))
  );

  // 2. Permissions (module × action)
  const permsRows = MODULES.flatMap((m) =>
    ACTIONS.map((a) => ({
      module: m.id,
      action: a.id,
      description: `${a.label} · ${m.label}`,
    }))
  );
  const insertedPerms = await db.insert(permissions).values(permsRows).returning();
  const permMap = new Map<string, number>();
  for (const p of insertedPerms) permMap.set(`${p.module}:${p.action}`, p.id);

  // 3. Affectation rôle ↔ permissions
  const rpRows: { roleId: string; permissionId: number }[] = [];
  for (const role of ROLES) {
    const matrix = PERMISSIONS_PAR_ROLE[role.id];
    for (const m of MODULES) {
      const acts = matrix?.[m.id];
      if (!acts) continue;
      for (const a of acts) {
        const pid = permMap.get(`${m.id}:${a}`);
        if (pid) rpRows.push({ roleId: role.id, permissionId: pid });
      }
    }
  }
  await db.insert(rolePermissions).values(rpRows);

  // 4. Paramètres entreprise
  const [settingsExist] = await db.select().from(companySettings).limit(1);
  if (!settingsExist) {
    await db.insert(companySettings).values({
      nom: "KasayiMultiBusiness",
      slogan: "Agriculture · Commerce · Transport · Services",
      adresse: "Avenue de l'Agriculture, Quartier Kasayi",
      ville: "Kananga",
      telephone: "+243 000 000 000",
      email: "contact@kasayimultibusiness.cd",
      devisePrincipale: "CDF",
      tvaTaux: "16",
    });
  }

  // 5. Taux de change
  const ratesExist = await db.select().from(exchangeRates).limit(1);
  if (ratesExist.length === 0) {
    await db.insert(exchangeRates).values([
      { devise: "USD", rate: "2850", setBy: "setup" },
      { devise: "EUR", rate: "3050", setBy: "setup" },
    ]);
  }

  // 6. Utilisateurs de démonstration (auth NextAuth à brancher au déploiement)
  const usersExist = await db.select().from(users).limit(1);
  if (usersExist.length === 0) {
    await db.insert(users).values([
      { name: "Mubarak Kasayi", email: "admin@kasayimulti.cd", roleId: "super_admin", isActive: true },
      { name: "Comptable Principal", email: "comptable@kasayimulti.cd", roleId: "comptable", isActive: true },
      { name: "Responsable Agriculture", email: "agri@kasayimulti.cd", roleId: "responsable", isActive: true },
      { name: "Agent de Caisse", email: "caisse@kasayimulti.cd", roleId: "caissier", isActive: true },
      { name: "Agent de Saisie", email: "saisie@kasayimulti.cd", roleId: "saisie", isActive: true },
    ]);
  }

  return NextResponse.json({
    ok: true,
    roles: ROLES.length,
    permissions: insertedPerms.length,
    affectations: rpRows.length,
  });
}
