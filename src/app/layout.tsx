import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "greek"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "S.cleaning — Κλείστε καθαρισμό",
  description:
    "Υπηρεσίες καθαρισμού και απεντόμωσης στη Νέα Πλαγιά Χαλκιδικής. Κλείστε ραντεβού — η τιμή καθορίζεται κατόπιν συνεννόησης.",
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
    <html lang="el" className={`${notoSans.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
