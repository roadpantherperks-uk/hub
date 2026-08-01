import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  MapPin,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Road Panther Perks — email, WhatsApp, Instagram, Facebook. Based in Newcastle upon Tyne.",
  openGraph: {
    title: "Contact — Road Panther Perks",
    description:
      "Email, WhatsApp, Instagram, Facebook. Based in Newcastle upon Tyne.",
  },
};

const PHONE_E164 = "447780195918";
const PHONE_DISPLAY = "07780 195918";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/95 to-background" />
      </div>

      <Header />

      <main className="container mx-auto px-6 lg:px-8 pt-28 pb-32 max-w-3xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>

        <header className="mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
            <span className="block w-6 h-px bg-brand" />
            Contact
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
            Say <span className="text-brand">hello</span>.
          </h1>
          <p className="mt-5 text-muted-foreground leading-relaxed text-lg max-w-xl">
            Got a question, want to partner your business, or interested in
            joining? We&apos;d love to hear from you.
          </p>
        </header>

        {/* Primary contact methods */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ContactCard
            icon={Mail}
            label="Email"
            value="hello@roadpantherperks.co.uk"
            href="mailto:hello@roadpantherperks.co.uk"
            primary
          />
          <ContactCard
            icon={MessageCircle}
            label="WhatsApp"
            value={PHONE_DISPLAY}
            href={`https://wa.me/${PHONE_E164}`}
            external
            note="Quickest response"
            primary
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <ContactCard
            icon={Phone}
            label="Phone"
            value={PHONE_DISPLAY}
            href={`tel:+${PHONE_E164}`}
          />
          <ContactCard
            icon={MapPin}
            label="Based in"
            value="Newcastle upon Tyne, UK"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <ContactCard
            icon={Instagram}
            label="Instagram"
            value="@road_panther_perks"
            href="https://www.instagram.com/road_panther_perks"
            external
          />
          <ContactCard
            icon={Facebook}
            label="Facebook"
            value="Road Panther Perks"
            href="https://www.facebook.com/profile.php?id=61589263567164"
            external
          />
        </div>

        {/* Operational note */}
        <div className="hairline rounded-2xl bg-card-soft p-6 mt-10">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Response times
          </div>
          <p className="text-sm leading-relaxed">
            WhatsApp and email are the quickest ways to reach us — we usually
            reply within a few hours during the day. We&apos;re a small,
            North-East-based team building this for drivers like you.
          </p>
        </div>

        {/* Cross-links */}
        <div className="mt-16 pt-8 hairline-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy policy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms &amp; conditions
          </Link>
          <Link
            href="/signup"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Create driver account
          </Link>
        </div>
      </main>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external,
  note,
  primary,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  note?: string;
  primary?: boolean;
}) {
  const inner = (
    <div
      className={`hairline rounded-2xl p-6 transition-colors h-full flex flex-col ${
        primary ? "bg-card-soft hover:border-brand/40" : "bg-card-soft hover:border-brand/30"
      } ${href ? "cursor-pointer group" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between">
        <Icon className="size-5 text-brand" strokeWidth={1.5} />
        {href ? (
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : null}
      </div>
      <div className="mt-8 flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1.5 font-medium text-[15px] break-all">{value}</div>
        {note ? (
          <div className="mt-2 text-xs text-brand">{note}</div>
        ) : null}
      </div>
    </div>
  );

  if (!href) return inner;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block"
    >
      {inner}
    </a>
  );
}
