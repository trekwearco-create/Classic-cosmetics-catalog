import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Figtree } from "next/font/google";

import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-bodoni",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Classic Cosmetics",
    template: "%s | Classic Cosmetics",
  },
  description: "Elegance in Every Detail",
  metadataBase: new URL(
    process.env.SITE_URL ?? "https://classic-cosmetics.vercel.app",
  ),
  icons: {
    icon: "/icon-32.png",
    apple: "/icon-180.png",
  },
  openGraph: {
    siteName: "Classic Cosmetics",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#EFE5D8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
