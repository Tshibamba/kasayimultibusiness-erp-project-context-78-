import type { ReactNode } from "react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { FlashTicker } from "@/components/public/flash-ticker";
import { HashScroll } from "@/components/public/hash-scroll";
import { ChatWidget } from "@/components/ai/chat-widget";
import { FLASH_INFOS } from "@/lib/public/site-data";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <FlashTicker items={FLASH_INFOS} />
      <HashScroll />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
