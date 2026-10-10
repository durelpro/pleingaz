import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pleingaz - Votre gaz domestique en un clic",
  description: "Achetez votre bouteille de gaz domestique au prix officiel au Cameroun. Livraison rapide, paiement sécurisé (Mobile Money).",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  openGraph: {
    title: "Pleingaz - Votre gaz domestique",
    description: "Le gaz domestique au juste prix, livré chez vous.",
    url: "https://pleingaz.cm",
    siteName: "Pleingaz",
    locale: "fr_CM",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
