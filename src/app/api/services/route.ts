import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await db
    .select()
    .from(services)
    .where(eq(services.isPublished, true))
    .orderBy(asc(services.ordre));
  return NextResponse.json({ items });
}
