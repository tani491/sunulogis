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
  title: "AubergeConnect - Réservation d'Auberges au Sénégal",
  description: "Trouvez et réservez des auberges et maisons d'hôtes à travers le Sénégal. Gestion de réservations simplifiée pour propriétaires.",
  keywords: ["auberge", "Sénégal", "réservation", "maison d'hôtes", "Dakar", "Saint-Louis", "Saly", "voyage"],
  authors: [{ name: "AubergeConnect" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AubergeConnect",
    description: "Réservation d'auberges et maisons d'hôtes au Sénégal",
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
