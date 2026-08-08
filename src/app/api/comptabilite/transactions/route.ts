import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, accounts } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db
    .select({
      id: transactions.id,
      accountId: transactions.accountId,
      accountNom: accounts.nom,
      type: transactions.type,
      montant: transactions.montant,
      description: transactions.description,
      module: transactions.module,
      reference: transactions.reference,
      date: transactions.date,
    })
    .from(transactions)
    .leftJoin(accounts, eq(accounts.id, transactions.accountId))
    .orderBy(desc(transactions.date))
    .limit(100);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accountId = Number(body.accountId);
    const montant = Number(body.montant);
    const type = body.type === "ENTREE" ? "ENTREE" : "SORTIE";
    if (!accountId || !montant) {
      return NextResponse.json({ error: "Compte et montant requis." }, { status: 400 });
    }
    const [tx] = await db
      .insert(transactions)
      .values({
        accountId,
        type,
        montant: String(montant),
        description: body.description ?? null,
        module: body.module ?? null,
        reference: body.reference ?? null,
      })
      .returning();
    const sign = type === "ENTREE" ? 1 : -1;
    await db
      .update(accounts)
      .set({ solde: sql`${accounts.solde} + ${sign * montant}` })
      .where(eq(accounts.id, accountId));
    return NextResponse.json({ item: tx }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
