"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { adminCreateBusiness } from "@/integrations/supabase/partner-actions";
import { Button } from "@/components/ui/button";
import { TIERS, poundsLabel, type PlanKey } from "@/lib/tiers";
import { BUSINESS_CATEGORIES, OTHER_VALUE } from "@/lib/options";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

const schema = z
  .object({
    business_name: z.string().min(2, "Business name is required"),
    contact_name: z.string().optional().or(z.literal("")),
    contact_email: z.string().email("Enter a valid email"),
    contact_phone: z.string().optional().or(z.literal("")),
    website: z.string().optional().or(z.literal("")),
    category: z.string().optional().or(z.literal("")),
    category_other: z.string().max(80).optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    description: z.string().max(600).optional().or(z.literal("")),
    admin_note: z.string().optional().or(z.literal("")),
  })
  .refine((v) => v.category !== OTHER_VALUE || !!v.category_other?.trim(), {
    message: "Enter what type of business this is",
    path: ["category_other"],
  });

type Status = "approved" | "pending";

export default function NewBusiness() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>("approved");
  const [plan, setPlan] = useState<PlanKey>("basic");
  const [form, setForm] = useState({
    business_name: "", contact_name: "", contact_email: "", contact_phone: "",
    website: "", category: "", category_other: "", location: "", description: "",
    admin_note: "",
  });

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSaving(true);
    const res = await adminCreateBusiness({ ...parsed.data, status, plan });
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Business added");
    // Straight to the detail page — that's where perks and the payment link live.
    router.push(`/admin/businesses/${res.data!.business_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/businesses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to businesses
      </Link>

      <div>
        <h1 className="font-display font-black text-3xl md:text-4xl">Add a business</h1>
        <p className="text-muted-foreground mt-1">
          For partners signed up over the phone or in person. No email is sent — you can
          generate a payment link on the next screen.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-6 space-y-5">
        <Field label="Business name *" value={form.business_name} onChange={upd("business_name")} placeholder="e.g. North East Tyres Ltd" />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Contact name" value={form.contact_name} onChange={upd("contact_name")} />
          <Field label="Contact email *" type="email" value={form.contact_email} onChange={upd("contact_email")} />
          <Field label="Phone" value={form.contact_phone} onChange={upd("contact_phone")} />
          <Field label="Website" value={form.website} onChange={upd("website")} placeholder="https://" />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value,
                  category_other: e.target.value === OTHER_VALUE ? f.category_other : "",
                }))
              }
              className={inputCls}
            >
              <option value="">— select —</option>
              {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {form.category === OTHER_VALUE && (
              <input
                value={form.category_other}
                onChange={upd("category_other")}
                className={`${inputCls} mt-2`}
                placeholder="What type of business is it?"
                maxLength={80}
              />
            )}
          </div>

          <Field label="Location" value={form.location} onChange={upd("location")} placeholder="e.g. Newcastle" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={inputCls}>
              <option value="approved">Approved — live partner</option>
              <option value="pending">Pending — review later</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value as PlanKey)} className={inputCls}>
              {(Object.keys(TIERS) as PlanKey[]).map((k) => (
                <option key={k} value={k}>
                  {TIERS[k].label} — {poundsLabel(TIERS[k].pence)}/mo, {TIERS[k].offers} offer
                  {TIERS[k].offers === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Field label="Description" value={form.description} onChange={upd("description")} textarea />
        <Field label="Admin note (internal)" value={form.admin_note} onChange={upd("admin_note")} textarea />

        <Button type="submit" disabled={saving} variant="hero" size="lg" className="w-full">
          {saving ? <><Loader2 className="size-4 animate-spin" /> Adding…</> : <><Plus className="size-4" /> Add business</>}
        </Button>
      </form>
    </div>
  );
}

const inputCls =
  "block w-full h-11 rounded-xl bg-background hairline px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40";

function Field({
  label, value, onChange, placeholder, type, textarea,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="block w-full rounded-xl bg-background hairline px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );
}
