import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ContextProvider } from "@/context/Providers";
import LayoutGeneral from "@/components/layout/LayoutGeneral";

export const metadata: Metadata = {
  title: "TestiGO App",
  description: "Sistema de gestión de testimonios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ContextProvider>
          <LayoutGeneral>{children}</LayoutGeneral>
        </ContextProvider>
      </body>
    </html>
  );
}
