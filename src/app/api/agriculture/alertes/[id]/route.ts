import { NextRequest, NextResponse } from "next/server";
import { acquitterAlerte } from "@/lib/agriculture/stock-service";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const note = body.note ? String(body.note) : undefined;
    const alerte = await acquitterAlerte(Number(id), note);
    if (!alerte) {
      return NextResponse.json({ error: "Alerte introuvable." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, alerte });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
