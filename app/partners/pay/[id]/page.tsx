"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { PublicShell } from "@/components/PublicShell";
import { startPartnerCheckout } from "@/integrations/supabase/partner-actions";
import { TIERS, type PlanKey } from "@/lib/tiers";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Check, Star } from "lucide-react";

export default function PayPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [plan, setPlan] = useState<PlanKey>("advanced");
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    if (!id) return;
    setLoading(true);
    const res = await startPartnerCheckout(id, plan);
    if (!res.ok) {
      setLoading(false);
      return toast.error(res.error);
    }
    window.location.href = res.data!.url;
  };

  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]">Choose your plan</h1>
          <p className="text-muted-foreground mt-3">Cancel anytime. Secured by Stripe.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {(["basic", "advanced"] as PlanKey[]).map((key) => {
            const tier = TIERS[key];
            const selected = plan === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPlan(key)}
                className={`text-left panel rounded-2xl p-6 transition-colors relative ${
                  selected ? "border-brand ring-2 ring-brand/40" : "hover:border-brand/30"
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-2.5 right-5 inline-flex items-center gap-1 bg-brand text-black text-xs font-bold px-2.5 py-1 rounded-full">
                    <Star className="size-3" /> Recommended
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{tier.label}</span>
                  <span className={`size-5 rounded-full border grid place-items-center ${selected ? "bg-brand border-brand" : "border-muted-foreground/40"}`}>
                    {selected && <Check className="size-3 text-black" />}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-semibold">£{(tier.pence / 100).toFixed(0)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-brand shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={pay}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] px-8 h-12 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? <><Loader2 className="size-4 animate-spin" /> Redirecting…</> : <>Continue with {TIERS[plan].label} — £{(TIERS[plan].pence / 100).toFixed(0)}/mo</>}
          </button>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Secured by Stripe · cancel anytime
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
