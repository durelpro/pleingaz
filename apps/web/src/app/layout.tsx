import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#dc2626",
};

export const metadata: Metadata = {
  title: "PLEINGAZ — Bouteilles toujours pleines | Réseau Officiel de Distribution",
  description: "Réseau numérique officiel PLEINGAZ au Cameroun. Nos produits, votre énergie. Gaz domestique au prix officiel garanti, disponibilité vérifiée en direct et livraison rapide.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "PLEINGAZ — Bouteilles toujours pleines",
    description: "Trouvez votre bouteille de gaz PLEINGAZ au prix officiel garanti. Disponibilité en temps réel et livraison à domicile.",
    url: "https://monpleingaz.com",
    siteName: "PLEINGAZ",
    locale: "fr_CM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${montserrat.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0a0a0a] text-neutral-100">{children}</body>
    </html>
  );
}

