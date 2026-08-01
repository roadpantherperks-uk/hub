import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { UserPlus, BadgeCheck, Tag, ArrowRight, Building2, Handshake, Megaphone } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works — Road Panther Perks",
  description: "How Road Panther Perks works for drivers and for businesses.",
};

const DRIVER_STEPS = [
  { icon: UserPlus, title: "Sign up free", desc: "Create your account in minutes and upload proof you're a road professional." },
  { icon: BadgeCheck, title: "Get verified", desc: "Our team hand-checks every member, so perks stay with the people they're meant for." },
  { icon: Tag, title: "Start saving", desc: "Unlock exclusive discounts and support built for drivers across the North East & Teesside." },
];

const BUSINESS_STEPS = [
  { icon: Building2, title: "Apply to partner", desc: "Tell us about your business and the offer you'd bring to our members." },
  { icon: Handshake, title: "Get approved", desc: "Once approved, choose your plan and activate your membership securely via Stripe." },
  { icon: Megaphone, title: "Reach drivers", desc: "Your perk goes live in front of a growing community of verified road professionals." },
];

export default function HowItWorks() {
  return (
    <PublicShell>
      <PageHeader
        eyebrow="How it works"
        title="Simple for drivers. Simple for business."
        subtitle="A free membership platform helping professional drivers and mobile workers access savings, support and opportunities — and a direct line for businesses to reach them."
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-16">
        <Section title="For road professionals" steps={DRIVER_STEPS} cta={{ href: "/signup", label: "Join free" }} />
        <Section title="For businesses" steps={BUSINESS_STEPS} cta={{ href: "/partners/apply", label: "Become a partner" }} />
      </div>
    </PublicShell>
  );
}

function Section({
  title, steps, cta,
}: {
  title: string;
  steps: { icon: typeof UserPlus; title: string; desc: string }[];
  cta: { href: string; label: string };
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-8">{title}</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <div key={s.title} className="panel rounded-2xl p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="size-11 rounded-xl bg-brand/15 grid place-items-center">
                <s.icon className="size-5 text-brand" strokeWidth={1.5} />
              </div>
              <span className="text-4xl font-semibold text-brand/30">{i + 1}</span>
            </div>
            <h3 className="font-semibold text-lg">{s.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <Link
        href={cta.href}
        className="mt-6 inline-flex items-center gap-1.5 bg-foreground text-background font-semibold text-sm px-5 h-11 rounded-full hover:bg-foreground/90 transition-colors"
      >
        {cta.label} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
