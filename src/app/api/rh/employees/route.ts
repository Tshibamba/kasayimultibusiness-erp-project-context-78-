import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { employees } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(employees).orderBy(asc(employees.nom));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [item] = await db
      .insert(employees)
      .values(body as typeof employees.$inferInsert)
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
