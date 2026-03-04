import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talk to Rocky — Eridian Communication Interface",
  description:
    "A fan-built, AI-enabled Eridian communication interface inspired by Project Hail Mary by Andy Weir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono antialiased">{children}</body>
    </html>
  );
}
