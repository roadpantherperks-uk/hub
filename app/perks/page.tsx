import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { getActivePerks } from "@/integrations/supabase/public-data";
import { Tag, ArrowRight, Lock, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Perks — Road Panther Perks",
  description:
    "Exclusive discounts and rewards for professional drivers and mobile workers across the North East & Teesside.",
};

export const dynamic = "force-dynamic";

export default async function PerksPage() {
  const perks = await getActivePerks();

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Perks"
        title="Savings built for road professionals"
        subtitle="A preview of the discounts and rewards our members unlock. Join free to redeem — new perks are added as we sign partners."
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {perks.length === 0 ? (
          <div className="panel rounded-2xl p-12 text-center">
            <Tag className="size-10 mx-auto mb-4 text-brand" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold">Perks launching soon</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              We&apos;re signing our founding partners now. Join free and we&apos;ll notify you the moment perks go live.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-1.5 bg-foreground text-background font-semibold text-sm px-5 h-11 rounded-full hover:bg-foreground/90 transition-colors"
            >
              Join free <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {perks.map((p) => (
                <div
                  key={p.id}
                  className={`panel rounded-2xl p-6 flex flex-col transition-colors relative ${
                    p.recommended ? "border-brand/40" : "hover:border-brand/30"
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 bg-brand text-black text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <Star className="size-3" /> Recommended
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    {p.business_logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.business_logo} alt={p.business_name ?? ""} className="size-11 rounded-xl object-contain bg-white/5 p-1" />
                    ) : (
                      <div className="size-11 rounded-xl bg-brand/15 grid place-items-center">
                        <Tag className="size-5 text-brand" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{p.business_name}</div>
                      {p.category_name && <div className="text-xs text-muted-foreground">{p.category_name}</div>}
                    </div>
                  </div>
                  <h3 className="font-semibold">{p.title}</h3>
                  {p.discount_label && <div className="mt-1 text-brand font-semibold">{p.discount_label}</div>}
                  {p.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.summary}</p>}
                  <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="size-3" /> Members only
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 panel rounded-2xl p-8 text-center">
              <h2 className="text-xl font-semibold">Not a member yet?</h2>
              <p className="text-muted-foreground mt-2">Join free and start redeeming perks on the road.</p>
              <Link
                href="/signup"
                className="mt-5 inline-flex items-center gap-1.5 bg-foreground text-background font-semibold text-sm px-5 h-11 rounded-full hover:bg-foreground/90 transition-colors"
              >
                Sign up free <ArrowRight className="size-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}
