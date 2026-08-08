import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff, getCurrentClient } from "@/lib/auth";
import { chat } from "@/lib/ai/service";
import type { ChatMessage } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Auth obligatoire
    const staff = await getCurrentStaff();
    const client = await getCurrentClient();
    const user = staff || client;
    if (!user) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "Aucun message." }, { status: 400 });
    }

    const result = await chat(
      { messages, conversationId: body.conversationId },
      { id: user.id, name: staff?.name || client?.nom || "Utilisateur", role: staff?.roleId ?? undefined },
    );

    return NextResponse.json(result);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Limite")) return NextResponse.json({ error: msg }, { status: 429 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
