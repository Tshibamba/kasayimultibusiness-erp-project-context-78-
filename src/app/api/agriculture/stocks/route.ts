import { NextResponse } from "next/server";
import { getStocksListe } from "@/lib/agriculture/stock-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getStocksListe();
  return NextResponse.json(data);
}
