import { NextResponse } from "next/server";
import { db } from "@/db";
import { loginHistory } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(loginHistory).orderBy(desc(loginHistory.createdAt)).limit(50);
  return NextResponse.json({ items });
}
