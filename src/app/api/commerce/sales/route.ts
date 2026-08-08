import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales } from "@/db/schema";
import { desc } from "drizzle-orm";
import { calculerTVA, calculerTTC } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(sales).orderBy(desc(sales.date));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const totalHT = Number(body.totalHT ?? 0);
    const taxe = calculerTVA(totalHT);
    const totalTTC = calculerTTC(totalHT);
    const [item] = await db
      .insert(sales)
      .values({
        client: body.client ?? "Client comptant",
        reference: body.reference ?? `FAC-COM-${Date.now().toString().slice(-6)}`,
        totalHT: String(totalHT),
        taxe: String(taxe),
        totalTTC: String(totalTTC),
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
