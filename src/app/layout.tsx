import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SunuLogis - Trouvez votre logement au Sénégal",
  description: "Découvrez auberges, hôtels, appartements et lodges à travers les 14 régions du Sénégal. Réservation simplifiée avec confirmation via WhatsApp.",
  keywords: ["sunulogis", "logement", "Sénégal", "réservation", "auberge", "hôtel", "appartement", "lodge", "Dakar", "Saint-Louis", "Saly", "voyage"],
  authors: [{ name: "SunuLogis" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SunuLogis",
    description: "Trouvez votre logement au Sénégal - Auberges, hôtels, appartements et lodges",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
