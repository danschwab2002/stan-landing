import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STAN — Creative Production House",
  description:
    "Transformamos ideas grandes, complejas e imposibles en experiencias, contenidos y producciones que generan impacto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
