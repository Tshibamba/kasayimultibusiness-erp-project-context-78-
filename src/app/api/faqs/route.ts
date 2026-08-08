import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db.select().from(faqs).orderBy(asc(faqs.ordre));
  return NextResponse.json({ items });
}
