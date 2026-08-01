"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { z } from "zod";
import { PublicShell, PageHeader } from "@/components/PublicShell";
import { applyToPartner } from "@/integrations/supabase/partner-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";

const schema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  contact_name: z.string().min(2, "Your name is required"),
  contact_email: z.string().email("Enter a valid email"),
  contact_phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  description: z.string().max(600).optional().or(z.literal("")),
});

const CATEGORIES = [
  "Fuel & EV Charging", "Tyres & Maintenance", "Insurance", "Food & Drink",
  "Vehicle Accessories", "Business Services", "Other",
];

export default function PartnerApply() {
  const [form, setForm] = useState({
    business_name: "", contact_name: "", contact_email: "", contact_phone: "",
    website: "", category: "", location: "", description: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSaving(true);
    const res = await applyToPartner(parsed.data);
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    setDone(true);
  };

  if (done) {
    return (
      <PublicShell>
        <div className="max-w-xl mx-auto px-6 lg:px-8 text-center pt-8">
          <CheckCircle2 className="size-14 mx-auto text-brand mb-6" strokeWidth={1.5} />
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Application received</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Thanks — we&apos;ve got your details and sent a confirmation to your email. Our team will review
            your application and be in touch. Once approved, you&apos;ll get a secure link to activate your
            Founding Partner membership.
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-brand font-medium hover:underline">
            Back to home <ArrowRight className="size-4" />
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <PageHeader
        eyebrow="Become a partner"
        title="Put your business in front of road professionals"
        subtitle="Partner listings from £9/month (Basic) or £24/month (Advanced) — a business profile, driver offers, and exposure to our driver community. Apply below; you'll choose your plan once you're approved. No payment until then."
      />

      <div className="max-w-xl mx-auto px-6 lg:px-8">
        <form onSubmit={onSubmit} className="panel rounded-2xl p-6 sm:p-8 space-y-5">
          <Row label="Business name *">
            <input value={form.business_name} onChange={upd("business_name")} className={inputCls} placeholder="e.g. North East Tyres Ltd" />
          </Row>
          <div className="grid sm:grid-cols-2 gap-4">
            <Row label="Your name *">
              <input value={form.contact_name} onChange={upd("contact_name")} className={inputCls} />
            </Row>
            <Row label="Email *">
              <input type="email" value={form.contact_email} onChange={upd("contact_email")} className={inputCls} />
            </Row>
            <Row label="Phone">
              <input value={form.contact_phone} onChange={upd("contact_phone")} className={inputCls} />
            </Row>
            <Row label="Website">
              <input value={form.website} onChange={upd("website")} className={inputCls} placeholder="https://" />
            </Row>
            <Row label="Category">
              <select value={form.category} onChange={upd("category")} className={inputCls}>
                <option value="">— select —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Row>
            <Row label="Location">
              <input value={form.location} onChange={upd("location")} className={inputCls} placeholder="e.g. Newcastle" />
            </Row>
          </div>
          <Row label="Tell us about your business & the offer you'd provide">
            <textarea value={form.description} onChange={upd("description")} rows={4} className={inputCls} />
          </Row>
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] h-12 rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {saving ? <><Loader2 className="size-4 animate-spin" /> Submitting…</> : <>Submit application <ArrowRight className="size-4" /></>}
          </button>
          <p className="text-[11px] text-muted-foreground text-center">
            No payment is taken now. If approved, we&apos;ll email you a secure Stripe link to start your membership.
          </p>
        </form>
      </div>
    </PublicShell>
  );
}

const inputCls =
  "block w-full h-12 rounded-xl bg-background hairline px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
