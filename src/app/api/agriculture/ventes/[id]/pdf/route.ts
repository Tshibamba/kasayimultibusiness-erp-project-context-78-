import { NextRequest } from "next/server";
import { db } from "@/db";
import { venteAgricole, companySettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildInvoicePdf } from "@/lib/pdf";
import { toNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vente] = await db.select().from(venteAgricole).where(eq(venteAgricole.id, Number(id)));
  if (!vente) return new Response("Vente introuvable.", { status: 404 });

  const [company] = await db.select().from(companySettings).limit(1);
  const total = toNum(vente.total);
  const totalHT = Math.round(total / 1.16);
  const taxe = total - totalHT;

  const buf = await buildInvoicePdf({
    company: company ?? { nom: "KasayiMultiBusiness" },
    reference: `FAC-AGR-${vente.id}`,
    client: vente.client ?? "Client",
    date: vente.date
      ? new Intl.DateTimeFormat("fr-CD", { dateStyle: "long" }).format(new Date(vente.date))
      : new Intl.DateTimeFormat("fr-CD", { dateStyle: "long" }).format(new Date()),
    lignes: [{ designation: vente.produit ?? "Produit agricole", quantite: toNum(vente.quantite), pu: toNum(vente.prixUnitaire) }],
    totalHT,
    taxe,
    totalTTC: total,
  });

  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="facture-agr-${vente.id}.pdf"` },
  });
}
