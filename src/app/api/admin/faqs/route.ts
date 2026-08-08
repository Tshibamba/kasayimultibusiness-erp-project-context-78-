import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = String(body.question ?? "").trim();
    if (!question) return NextResponse.json({ error: "La question est obligatoire." }, { status: 400 });
    const [item] = await db
      .insert(faqs)
      .values({
        question,
        reponse: String(body.reponse ?? "").trim() || "—",
        categorie: body.categorie || "Général",
        ordre: Number(body.ordre) || 0,
      })
      .returning();
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
