import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-15"
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

        <header className="mb-12 pb-10 hairline-b">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
            <span className="block w-6 h-px bg-brand" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective from {effectiveDate}
          </p>
        </header>

        <article className="legal-prose">{children}</article>

        <div className="mt-20 pt-10 hairline-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
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
            Terms & conditions
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>
      </main>
    </div>
  );
}
