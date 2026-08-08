import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await getCurrentClient();
  return NextResponse.json({ client });
}
