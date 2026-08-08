import { NextRequest, NextResponse } from "next/server";
import { getAlertes } from "@/lib/agriculture/stock-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const actives = url.searchParams.get("actives") === "1";
  const items = await getAlertes(actives);
  return NextResponse.json({ items });
}
