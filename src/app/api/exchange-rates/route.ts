import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exchangeRates } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.date))
    .limit(30);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const devise = String(body.devise ?? "").toUpperCase();
    const rate = Number(body.rate);
    if (!["USD", "EUR"].includes(devise) || !Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json(
        { error: "Devise (USD/EUR) et taux valide requis." },
        { status: 400 }
      );
    }
    const [item] = await db
      .insert(exchangeRates)
      .values({ devise, rate: rate.toString(), setBy: body.setBy ?? "admin" })
      .returning();
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
