"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck, ShieldCheck, CalendarDays, Percent, Fuel, Handshake, LifeBuoy, Star,
  User,
} from "lucide-react";
import { memberId, cardName, displayDriverType } from "@/lib/options";

/**
 * The digital membership card a driver shows in-store to claim an offer.
 *
 * Rendered live rather than as an image on purpose: the date stamp updates
 * every day, so a screenshot passed to a friend visibly ages. It isn't
 * tamper-proof — see the note in app/dashboard/card/page.tsx — but it raises
 * the cost of casual sharing without any scanning hardware at the merchant end.
 */

export type MemberCardProps = {
  firstName: string;
  surname: string;
  memberNumber: number | null;
  driverType: string;
  driverTypeOther: string | null;
  memberSince: string; // ISO
  photoUrl: string | null;
  verified: boolean;
};

const BENEFITS = [
  { icon: Percent, label: "Exclusive\ndiscounts" },
  { icon: Fuel, label: "Fuel & vehicle\nsavings" },
  { icon: Handshake, label: "Trusted local\npartners" },
  { icon: LifeBuoy, label: "Emergency\nsupport" },
  { icon: Star, label: "Special member\noffers" },
];

export function MemberCard(props: MemberCardProps) {
  const {
    firstName, surname, memberNumber, driverType, driverTypeOther,
    memberSince, photoUrl, verified,
  } = props;

  // Rendered client-side so the stamp reflects the viewer's day, not build time.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      }),
    );
  }, []);

  return (
    <div className="mx-auto w-full max-w-[420px] rounded-[28px] p-[3px] bg-gradient-to-b from-[#7c3aed] via-[#4c1d95] to-[#facc15] shadow-2xl">
      <div className="rounded-[25px] bg-[#0a0a0f] overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 text-center">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #a78bfa 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          />
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Road Panther Perks" className="mx-auto w-24 h-24 object-contain" />
            <h2 className="mt-2 font-display font-black text-xl leading-tight text-white">
              DRIVER SAVINGS &amp;
              <br />
              <span className="text-[#facc15]">BENEFITS NETWORK</span>
            </h2>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Driver information */}
          <Section title="Driver information" icon={User}>
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={firstName}
                    className="size-20 rounded-xl object-cover ring-2 ring-[#7c3aed]"
                  />
                ) : (
                  <div className="size-20 rounded-xl grid place-items-center ring-2 ring-[#7c3aed] bg-[#7c3aed]/10">
                    <User className="size-9 text-[#facc15]" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-2xl text-white truncate">
                  {cardName(firstName, surname)}
                </div>
                <div className="mt-1 text-xs text-white/70">
                  Member ID <span className="font-bold text-[#facc15]">{memberId(memberNumber)}</span>
                </div>
                <div className="text-xs text-white/70">
                  {verified ? "Verified" : "Unverified"}{" "}
                  <span className="font-semibold text-[#facc15]">
                    {displayDriverType(driverType, driverTypeOther)}
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Verification */}
          <Section title="Verification status" icon={BadgeCheck}>
            <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
              <Check label="ID verified" ok={verified} />
              <Check label="Active driver verified" ok={verified} />
              <div className="px-2">
                <CalendarDays className="size-5 mx-auto text-[#facc15]" strokeWidth={1.5} />
                <div className="mt-1.5 text-[9px] uppercase tracking-wider text-white/60 leading-tight">
                  Member since
                </div>
                <div className="text-sm font-bold text-[#facc15]">
                  {new Date(memberSince).getFullYear()}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-white/50">
              Verified through licence, operator badge or active platform account.
            </p>
          </Section>

          {/* Benefits */}
          <Section title="Member benefits" icon={Star}>
            <div className="grid grid-cols-5 gap-1">
              {BENEFITS.map((b) => (
                <div key={b.label} className="text-center px-0.5">
                  <b.icon className="size-5 mx-auto text-[#facc15]" strokeWidth={1.5} />
                  <div className="mt-1.5 text-[8px] uppercase tracking-wide text-white/70 leading-[1.3] whitespace-pre-line">
                    {b.label}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer — the live date is the anti-screenshot measure */}
        <div className="bg-[#facc15] px-4 py-2.5 text-center">
          <div className="text-[11px] font-bold text-black tracking-wide">
            {today ? `VALID ${today.toUpperCase()}` : " "}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title, icon: Icon, children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-4 pt-5 relative">
      <div className="absolute -top-2.5 left-3 inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-2.5 py-1">
        <Icon className="size-3 text-white" strokeWidth={2.5} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="px-2">
      <ShieldCheck
        className={`size-5 mx-auto ${ok ? "text-[#facc15]" : "text-white/25"}`}
        strokeWidth={1.5}
      />
      <div className="mt-1.5 text-[9px] uppercase tracking-wider text-white/60 leading-tight">
        {label}
      </div>
    </div>
  );
}
