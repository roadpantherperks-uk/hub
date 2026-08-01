"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminSetBusinessStatus,
  adminUpdateBusiness,
  adminSetBillingStatus,
  startPartnerCheckout,
  adminUpsertPerk,
  adminDeletePerk,
  type PerkInput,
} from "@/integrations/supabase/partner-actions";
import { Button } from "@/components/ui/button";
import { BusinessStatusBadge, BillingBadge } from "@/components/BusinessBadges";
import { TIERS, resolveTier, type PlanKey } from "@/lib/tiers";
import {
  ArrowLeft, Loader2, Check, X, Save, CreditCard, Copy, Plus, Trash2, Tag,
} from "lucide-react";
import { toast } from "sonner";

type Business = {
  id: string;
  name: string;
  slug: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  description: string | null;
  category: string | null;
  location: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  billing_status: "none" | "checkout_started" | "active" | "past_due" | "canceled";
  plan: string | null;
  admin_note: string | null;
  created_at: string;
};

type Perk = {
  id: string;
  title: string;
  discount_label: string | null;
  category_id: string | null;
  is_active: boolean;
  code: string | null;
  summary: string | null;
};

type Category = { id: string; name: string };

export default function BusinessDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [biz, setBiz] = useState<Business | null>(null);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const [payLink, setPayLink] = useState<string | null>(null);
  const [payPlan, setPayPlan] = useState<PlanKey>("advanced");

  const [edit, setEdit] = useState({
    name: "", contact_name: "", contact_email: "", contact_phone: "",
    website: "", category: "", location: "", description: "", admin_note: "",
  });

  const load = async () => {
    if (!id) return;
    const [{ data: b, error }, { data: p }, { data: c }] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", id).single(),
      supabase.from("perks").select("id, title, discount_label, category_id, is_active, code, summary").eq("business_id", id).order("sort_order"),
      supabase.from("perk_categories").select("id, name").order("sort_order"),
    ]);
    if (error || !b) {
      toast.error(error?.message ?? "Business not found");
      return;
    }
    const business = b as Business;
    setBiz(business);
    setPerks((p as Perk[] | null) ?? []);
    setCategories((c as Category[] | null) ?? []);
    setEdit({
      name: business.name,
      contact_name: business.contact_name ?? "",
      contact_email: business.contact_email,
      contact_phone: business.contact_phone ?? "",
      website: business.website ?? "",
      category: business.category ?? "",
      location: business.location ?? "",
      description: business.description ?? "",
      admin_note: business.admin_note ?? "",
    });
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setStatus = async (status: Business["status"]) => {
    if (!id) return;
    setBusy(true);
    const res = await adminSetBusinessStatus({ business_id: id, status, admin_note: edit.admin_note || null });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(status === "approved" ? "Approved — activation email sent" : `Marked ${status}`);
    void load();
  };

  const save = async () => {
    if (!id) return;
    setBusy(true);
    const res = await adminUpdateBusiness({
      business_id: id,
      name: edit.name,
      contact_name: edit.contact_name || null,
      contact_email: edit.contact_email,
      contact_phone: edit.contact_phone || null,
      website: edit.website || null,
      category: edit.category || null,
      location: edit.location || null,
      description: edit.description || null,
      admin_note: edit.admin_note || null,
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Saved");
    void load();
  };

  const genPayLink = async () => {
    if (!id) return;
    setBusy(true);
    const res = await startPartnerCheckout(id, payPlan);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setPayLink(res.data!.url);
    toast.success("Payment link created");
    void load();
  };

  const markActive = async () => {
    if (!id) return;
    setBusy(true);
    const res = await adminSetBillingStatus({ business_id: id, billing_status: "active" });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Marked active");
    void load();
  };

  if (!biz) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="animate-spin text-primary size-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/businesses" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to businesses
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-black text-2xl md:text-3xl">{biz.name}</h1>
          <BusinessStatusBadge status={biz.status} />
          <BillingBadge status={biz.billing_status} />
        </div>
        {biz.status === "pending" && (
          <div className="flex gap-2">
            <Button onClick={() => setStatus("approved")} disabled={busy} variant="hero" size="sm">
              <Check className="size-4" /> Approve
            </Button>
            <Button onClick={() => setStatus("rejected")} disabled={busy} variant="outline_glow" size="sm">
              <X className="size-4" /> Reject
            </Button>
          </div>
        )}
      </div>

      {/* Billing / payment */}
      {biz.status === "approved" && (
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="size-4 text-primary" /> Membership &amp; payment
          </div>
          {biz.billing_status === "active" ? (
            <p className="text-sm text-green-300">
              This partner is active and paying — {resolveTier(biz.plan).label} ({resolveTier(biz.plan).badge}).
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Approval already emailed the partner a link to choose their plan. You can also generate a link
                for a specific tier here to copy and send. Membership activates automatically once they pay.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={payPlan}
                  onChange={(e) => setPayPlan(e.target.value as PlanKey)}
                  className="h-9 rounded-lg bg-background hairline px-3 text-sm"
                >
                  {(["basic", "advanced"] as PlanKey[]).map((k) => (
                    <option key={k} value={k}>
                      {TIERS[k].label} — £{(TIERS[k].pence / 100).toFixed(0)}/mo
                    </option>
                  ))}
                </select>
                <Button onClick={genPayLink} disabled={busy} variant="hero" size="sm">
                  <CreditCard className="size-4" /> Create payment link
                </Button>
                <Button onClick={markActive} disabled={busy} variant="outline_glow" size="sm">
                  Mark active (manual)
                </Button>
              </div>
              {payLink && (
                <div className="flex items-center gap-2 rounded-xl bg-card-soft hairline p-3">
                  <input readOnly value={payLink} className="flex-1 bg-transparent text-xs font-mono outline-none" />
                  <button
                    onClick={() => { void navigator.clipboard.writeText(payLink); toast.success("Copied"); }}
                    className="text-brand hover:underline text-xs inline-flex items-center gap-1"
                  >
                    <Copy className="size-3.5" /> Copy
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Details form */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="text-sm font-semibold">Business details</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
          <Field label="Category" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} />
          <Field label="Contact name" value={edit.contact_name} onChange={(v) => setEdit({ ...edit, contact_name: v })} />
          <Field label="Contact email" value={edit.contact_email} onChange={(v) => setEdit({ ...edit, contact_email: v })} />
          <Field label="Phone" value={edit.contact_phone} onChange={(v) => setEdit({ ...edit, contact_phone: v })} />
          <Field label="Location" value={edit.location} onChange={(v) => setEdit({ ...edit, location: v })} />
          <Field label="Website" value={edit.website} onChange={(v) => setEdit({ ...edit, website: v })} />
        </div>
        <Field label="Description" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} textarea />
        <Field label="Admin note (internal)" value={edit.admin_note} onChange={(v) => setEdit({ ...edit, admin_note: v })} textarea />
        <Button onClick={save} disabled={busy} variant="hero" size="sm">
          <Save className="size-4" /> Save changes
        </Button>
      </div>

      {/* Perks */}
      <PerksManager
        businessId={biz.id}
        perks={perks}
        categories={categories}
        limit={resolveTier(biz.plan).offers}
        onChanged={load}
      />
    </div>
  );
}

function PerksManager({
  businessId, perks, categories, limit, onChanged,
}: {
  businessId: string;
  perks: Perk[];
  categories: Category[];
  limit: number;
  onChanged: () => Promise<void>;
}) {
  const atLimit = perks.length >= limit;
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<PerkInput>({
    business_id: businessId, title: "", discount_label: "", summary: "", code: "",
    category_id: null, redemption_type: "code", is_active: true,
  });

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Perk title is required");
    setBusy(true);
    const res = await adminUpsertPerk({ ...form, business_id: businessId });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("Perk saved");
    setAdding(false);
    setForm({ business_id: businessId, title: "", discount_label: "", summary: "", code: "", category_id: null, redemption_type: "code", is_active: true });
    await onChanged();
  };

  const toggle = async (perk: Perk) => {
    const res = await adminUpsertPerk({ id: perk.id, business_id: businessId, title: perk.title, is_active: !perk.is_active });
    if (!res.ok) return toast.error(res.error);
    await onChanged();
  };

  const remove = async (perkId: string) => {
    const res = await adminDeletePerk(perkId);
    if (!res.ok) return toast.error(res.error);
    toast.success("Deleted");
    await onChanged();
  };

  return (
    <div className="glass-strong rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="size-4 text-primary" /> Perks &amp; offers ({perks.length}/{limit})
        </div>
        <Button onClick={() => setAdding((v) => !v)} variant="outline_glow" size="sm" disabled={atLimit && !adding}>
          <Plus className="size-4" /> Add perk
        </Button>
      </div>
      {atLimit && (
        <p className="text-xs text-muted-foreground">
          Plan limit reached ({limit} offer{limit === 1 ? "" : "s"}). Upgrade this partner to Advanced for up to 3.
        </p>
      )}

      {adding && (
        <div className="rounded-xl bg-card-soft hairline p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Discount label (e.g. Save up to 20%)" value={form.discount_label ?? ""} onChange={(v) => setForm({ ...form, discount_label: v })} />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
                className="block w-full h-11 rounded-xl bg-background hairline px-3 text-sm"
              >
                <option value="">— none —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Field label="Redemption code (optional)" value={form.code ?? ""} onChange={(v) => setForm({ ...form, code: v })} />
          </div>
          <Field label="Summary" value={form.summary ?? ""} onChange={(v) => setForm({ ...form, summary: v })} textarea />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active ?? false} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Live on the public perks page
          </label>
          <Button onClick={submit} disabled={busy} variant="hero" size="sm">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save perk
          </Button>
        </div>
      )}

      {perks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No perks yet.</p>
      ) : (
        <div className="space-y-2">
          {perks.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-card-soft hairline p-3">
              <div>
                <div className="font-semibold text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.discount_label ?? "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(p)}
                  className={`text-xs px-2 py-1 rounded-md border ${p.is_active ? "bg-green-500/15 text-green-300 border-green-500/30" : "bg-gray-500/15 text-gray-300 border-gray-500/30"}`}
                >
                  {p.is_active ? "Live" : "Hidden"}
                </button>
                <button onClick={() => remove(p.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="block w-full rounded-xl bg-background hairline px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full h-11 rounded-xl bg-background hairline px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      )}
    </div>
  );
}
