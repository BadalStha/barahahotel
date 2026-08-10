import type { Metadata } from "next";
import { Inter, Rozha_One } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const rozhaOne = Rozha_One({
  variable: "--font-rozha",
  weight: "400",
  subsets: ["latin", "devanagari"],
});

export const metadata: Metadata = {
  title: "Baraha Hotel",
  description: "Baraha Hotel — official website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${rozhaOne.variable}`}>
      <body className="antialiased">
        {children}
        {/* Vercel Analytics (page views) + Speed Insights (Core Web Vitals) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
