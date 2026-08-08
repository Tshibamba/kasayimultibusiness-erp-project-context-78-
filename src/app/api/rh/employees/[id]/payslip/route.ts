import { NextRequest } from "next/server";
import { db } from "@/db";
import { employees, companySettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildPayslipPdf } from "@/lib/pdf";
import { toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [emp] = await db.select().from(employees).where(eq(employees.id, Number(id)));
  if (!emp) return new Response("Employé introuvable.", { status: 404 });

  const [company] = await db.select().from(companySettings).limit(1);
  const periode = new Intl.DateTimeFormat("fr-CD", { month: "long", year: "numeric" }).format(new Date());

  const buf = await buildPayslipPdf({
    company: company ?? { nom: "KasayiMultiBusiness" },
    employe: {
      nom: `${emp.prenom} ${emp.nom}`,
      poste: emp.poste,
      departement: emp.departement,
      typeContrat: emp.typeContrat,
      matricule: emp.id,
    },
    periode,
    salaireBase: toNum(emp.salaireBase),
  });

  const safeNom = `${emp.prenom}-${emp.nom}`.toLowerCase();
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bulletin-${safeNom}.pdf"`,
    },
  });
}
