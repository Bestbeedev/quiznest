import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { checkMaintenanceGate } from "@/lib/maintenance";
import { MaintenancePage } from "@/components/shared/maintenance-page";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizNest",
  description: "Créez, partagez et analysez vos évaluations en ligne.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gate = await checkMaintenanceGate();

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {gate.blocked ? <MaintenancePage message={gate.message} /> : children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
