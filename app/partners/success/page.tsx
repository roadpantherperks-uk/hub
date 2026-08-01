import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Welcome aboard — Road Panther Perks" };

export default function PartnerSuccess() {
  return (
    <PublicShell>
      <div className="max-w-xl mx-auto px-6 lg:px-8 text-center pt-8">
        <CheckCircle2 className="size-14 mx-auto text-brand mb-6" strokeWidth={1.5} />
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">You&apos;re a Founding Partner 🎉</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          Payment received and your membership is now active. We&apos;ve emailed your confirmation. Our team will
          be in touch to get your perks and branding live on the platform.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-brand font-medium hover:underline">
          Back to home <ArrowRight className="size-4" />
        </Link>
      </div>
    </PublicShell>
  );
}
