import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/agriculture/app-shell";
import { getAlertes } from "@/lib/agriculture/stock-service";
import { getCurrentStaff } from "@/lib/auth";
import { ChatWidget } from "@/components/ai/chat-widget";

export const dynamic = "force-dynamic";

export default async function ErpLayout({ children }: { children: ReactNode }) {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/login");

  let alertesActives = 0;
  try {
    alertesActives = (await getAlertes(true)).length;
  } catch {
    alertesActives = 0;
  }

  return (
    <>
      <AppShell alertesActives={alertesActives} staffName={staff.name} staffRole={staff.roleId}>
        {children}
      </AppShell>
      <ChatWidget />
    </>
  );
}
