import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roadpantherperks.co.uk"),
  title: {
    default: "Road Panther Perks — Driver Discounts in the North East & Teesside",
    template: "%s — Road Panther Perks",
  },
  description:
    "The driver support platform built for taxi, Uber, Bolt, delivery drivers and more. Free exclusive discounts across the North East & Teesside. Launching soon.",
  authors: [{ name: "Road Panther Perks" }],
  openGraph: {
    title: "Road Panther Perks — Coming Soon",
    description:
      "Free driver discounts across the North East & Teesside. Create your account today.",
    type: "website",
    images: ["/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Road Panther Perks — Coming Soon",
    description:
      "Free driver discounts across the North East & Teesside. Create your account today.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
