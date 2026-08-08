import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/auth";
import { getConversations, getConversationMessages } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) return NextResponse.json({ error: "Auth requis." }, { status: 401 });

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("id");

  if (conversationId) {
    const messages = await getConversationMessages(Number(conversationId));
    return NextResponse.json({ messages });
  }

  const conversations = await getConversations(staff.id);
  return NextResponse.json({ conversations });
}
