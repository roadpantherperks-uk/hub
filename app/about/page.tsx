import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { Heart, LifeBuoy, TrendingUp, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Road Panther Perks",
  description:
    "Road Panther Perks is a free membership platform for professional drivers and mobile workers across the North East & Teesside.",
};

const PILLARS = [
  { icon: Heart, title: "Wellbeing", desc: "Physical, mental and financial wellbeing resources for life on the road." },
  { icon: LifeBuoy, title: "Support", desc: "Roadside help and driver resources when you need them most." },
  { icon: TrendingUp, title: "Opportunities", desc: "Jobs, training and business growth to help members earn more." },
  { icon: Users, title: "Community", desc: "A network of drivers and mobile workers who look out for each other." },
];

export default function About() {
  return (
    <PublicShell>
      <PageHeader
        eyebrow="About us"
        title="More than a discount platform"
        subtitle="Road Panther Perks is a free membership platform helping professional drivers and mobile workers across the North East & Teesside access savings, support, wellbeing resources, opportunities and a thriving driver community."
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="panel rounded-2xl p-8 mb-12">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Whether you&apos;re a taxi driver, Uber driver, courier, driving instructor, mobile mechanic, tyre
            fitter, recovery operator or tradesperson — if you earn your living on the road, Road Panther Perks
            is built for you. We&apos;re starting with exclusive perks and growing into a full support network
            for the people who keep the North East &amp; Teesside moving.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p) => (
            <div key={p.title} className="panel rounded-2xl p-7">
              <div className="size-11 rounded-xl bg-brand/15 grid place-items-center mb-5">
                <p.icon className="size-5 text-brand" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/signup" className="inline-flex items-center gap-1.5 bg-foreground text-background font-semibold text-sm px-5 h-11 rounded-full hover:bg-foreground/90 transition-colors">
            Join free <ArrowRight className="size-4" />
          </Link>
          <Link href="/partners/apply" className="inline-flex items-center gap-1.5 hairline text-foreground font-semibold text-sm px-5 h-11 rounded-full hover:border-brand/40 transition-colors">
            Become a partner
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
