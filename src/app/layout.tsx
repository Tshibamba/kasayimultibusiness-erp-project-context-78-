import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KasayiMultiBusiness — Agriculture, Commerce & Services en RD Congo",
    template: "%s · KasayiMultiBusiness",
  },
  description:
    "Entreprise multi-activités au KasaÃ¯ Central : agriculture, commerce général, transport, sous-traitance et service traiteur. Partenaire de confiance en RD Congo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
