import { NextRequest } from "next/server";
import { db } from "@/db";
import { sales, companySettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildInvoicePdf } from "@/lib/pdf";
import { toNum, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sale] = await db.select().from(sales).where(eq(sales.id, Number(id)));
  if (!sale) return new Response("Vente introuvable.", { status: 404 });

  const [company] = await db.select().from(companySettings).limit(1);
  const buf = await buildInvoicePdf({
    company: company ?? { nom: "KasayiMultiBusiness" },
    reference: sale.reference ?? `FAC-${sale.id}`,
    client: sale.client ?? "Client",
    date: formatDate(sale.date),
    lignes: [{ designation: "Vente de marchandises", quantite: 1, pu: toNum(sale.totalHT) }],
    totalHT: toNum(sale.totalHT),
    taxe: toNum(sale.taxe),
    totalTTC: toNum(sale.totalTTC),
  });

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${sale.reference ?? `FAC-${sale.id}`}.pdf"`,
    },
  });
}
