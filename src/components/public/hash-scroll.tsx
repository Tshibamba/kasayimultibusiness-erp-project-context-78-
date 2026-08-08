"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fait défiler la page vers l'ancre (#...) de manière fiable,
 * y compris lors d'une navigation depuis une autre page.
 * (Next.js App Router ne gère pas toujours le scroll vers hash.)
 */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        // léger délai pour laisser le rendu se terminer
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  return null;
}
