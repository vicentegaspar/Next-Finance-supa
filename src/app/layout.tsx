import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarix - Gestão Financeira Pessoal",
  description: "Plataforma avançada de Gestão Financeira Pessoal com suporte multi-tenancy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Forçando "dark" default como solicitado pela UX
  return (
    <html lang="pt-BR" className={`dark ${inter.variable} ${outfit.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
