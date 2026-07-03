import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Sparkle Clean — Book a cleaning",
  description: "Mobile-friendly cleaning service booking. Pick a date, choose a time, browse services with upfront pricing.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#14b8a6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
