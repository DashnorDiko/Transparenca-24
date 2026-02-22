import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/context/AuthContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { SimulationProvider } from "@/context/SimulationContext";
import { ReportsProvider } from "@/context/ReportsContext";
import { ProposalsAndVotingProvider } from "@/context/ProposalsAndVotingContext";
import { SimulationUI } from "@/components/SimulationUI";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Transparenca24 | LLogaria AL – Ndjekim Paranë Publike",
  description:
    "Platformë transparence buxhetore për qytetarët shqiptarë. Ndjekni shpenzimet e bashkive dhe kontratat publike.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
            <AdminAuthProvider>
            <ReportsProvider>
            <ProposalsAndVotingProvider>
            <SimulationProvider>
              <Header />
              <main className="min-h-[calc(100vh-4rem)]">
                <PageTransition>{children}</PageTransition>
              </main>
              <SimulationUI />
            </SimulationProvider>
            </ProposalsAndVotingProvider>
            </ReportsProvider>
            </AdminAuthProvider>
            </AuthProvider>
            <Toaster richColors position="top-center" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
