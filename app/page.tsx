import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Road Panther Perks — Save more & drive smarter",
  description:
    "Driver support. Real savings. Built for you. Free exclusive discounts for verified drivers across the North East & Teesside. Coming soon.",
  openGraph: {
    title: "Road Panther Perks — Save more & drive smarter",
    description:
      "Driver support. Real savings. Built for you. Free exclusive discounts for verified drivers across the North East & Teesside.",
    type: "website",
    images: ["/og.jpg"],
  },
};

export default function Page() {
  return <LandingPage />;
}
