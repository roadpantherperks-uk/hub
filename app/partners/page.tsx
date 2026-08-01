import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { getApprovedPartners } from "@/integrations/supabase/public-data";
import { ArrowRight, Building2, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Partners — Road Panther Perks",
  description:
    "The businesses partnering with Road Panther Perks to support professional drivers across the North East & Teesside.",
};

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await getApprovedPartners();

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Partners"
        title="Businesses backing our drivers"
        subtitle="Road Panther Perks partners offer real savings and services to professional drivers and mobile workers across the North East & Teesside."
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {partners.length === 0 ? (
          <div className="panel rounded-2xl p-12 text-center">
            <Building2 className="size-10 mx-auto mb-4 text-brand" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold">Founding partners launching soon</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              We&apos;re signing our first founding partners now. Want your business in front of thousands of
              road professionals?
            </p>
            <Link
              href="/partners/apply"
              className="mt-6 inline-flex items-center gap-1.5 bg-foreground text-background font-semibold text-sm px-5 h-11 rounded-full hover:bg-foreground/90 transition-colors"
            >
              Become a partner <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {partners.map((p) => (
                <div
                  key={p.id}
                  className={`panel rounded-2xl p-6 transition-colors relative ${
                    p.recommended ? "border-brand/40" : "hover:border-brand/30"
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 bg-brand text-black text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <Star className="size-3" /> Recommended
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    {p.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.logo_url} alt={p.name} className="size-12 rounded-xl object-contain bg-white/5 p-1" />
                    ) : (
                      <div className="size-12 rounded-xl bg-brand/15 grid place-items-center">
                        <Building2 className="size-5 text-brand" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      {p.category && <div className="text-xs text-muted-foreground">{p.category}</div>}
                    </div>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    {p.location ? <span className="text-xs text-brand">{p.location}</span> : <span />}
                    <span className="text-[11px] text-muted-foreground">{p.badge}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 panel rounded-2xl p-8 text-center">
              <h2 className="text-xl font-semibold">Want to join them?</h2>
              <p className="text-muted-foreground mt-2">Get your business in front of thousands of road professionals.</p>
              <Link
                href="/partners/apply"
                className="mt-5 inline-flex items-center gap-1.5 bg-foreground text-background font-semibold text-sm px-5 h-11 rounded-full hover:bg-foreground/90 transition-colors"
              >
                Become a partner <ArrowRight className="size-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}
