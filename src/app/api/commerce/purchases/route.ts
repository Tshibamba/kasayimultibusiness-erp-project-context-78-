import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commercePurchase } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db.insert(commercePurchase).values({
      fournisseur: body.fournisseur ?? null,
      reference: body.reference ?? null,
      total: String(body.total ?? 0),
      date: body.date ?? null,
    }).returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
