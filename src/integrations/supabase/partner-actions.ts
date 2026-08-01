"use server";

import { adminClient } from "./admin-client";
import { hasRole } from "./server";
import { sendEmail, emailLayout, ADMIN_NOTIFY_EMAIL } from "../email";
import { createPartnerCheckout } from "../stripe";
import { TIERS, resolveTier, type PlanKey } from "@/lib/tiers";
import type { Database } from "./types";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "partner";
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

/* ------------------------------------------------------------------ public: apply */

export type PartnerApplicationInput = {
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  category?: string;
  location?: string;
  description?: string;
};

export async function applyToPartner(
  input: PartnerApplicationInput,
): Promise<ActionResult<{ business_id: string }>> {
  // Basic validation (defence in depth; the form validates too).
  if (!input.business_name?.trim()) return { ok: false, error: "Business name is required" };
  if (!input.contact_email?.trim()) return { ok: false, error: "Contact email is required" };

  const sb = adminClient();

  const insert: Database["public"]["Tables"]["businesses"]["Insert"] = {
    name: input.business_name.trim(),
    slug: slugify(input.business_name),
    contact_name: input.contact_name?.trim() || null,
    contact_email: input.contact_email.trim(),
    contact_phone: input.contact_phone?.trim() || null,
    website: input.website?.trim() || null,
    category: input.category?.trim() || null,
    location: input.location?.trim() || null,
    description: input.description?.trim() || null,
    status: "pending",
    billing_status: "none",
  };

  const { data, error } = await sb
    .from("businesses")
    .insert(insert)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not submit application" };
  }

  // A prospective perk partner by default; a business can gain more relationships later.
  await sb
    .from("business_relationships")
    .insert({ business_id: data.id, type: "perk_partner" });

  // Best-effort emails — never block the applicant on delivery.
  await Promise.allSettled([
    sendEmail({
      to: input.contact_email.trim(),
      subject: "We've received your Road Panther Perks application",
      html: emailLayout(
        "Thanks — we've got your application",
        `<p>Hi ${input.contact_name?.trim() || "there"},</p>
         <p>Thanks for applying to become a Road Panther Perks partner. Our team will review your details and get back to you shortly.</p>
         <p>Once approved, we'll email you a secure link to activate your Founding Partner membership (£150/month).</p>
         <p>— The Road Panther Perks team</p>`,
      ),
    }),
    ADMIN_NOTIFY_EMAIL
      ? sendEmail({
          to: ADMIN_NOTIFY_EMAIL,
          subject: `New partner application: ${input.business_name.trim()}`,
          html: emailLayout(
            "New partner application",
            `<p><strong>${input.business_name.trim()}</strong> has applied to join.</p>
             <ul>
               <li>Contact: ${input.contact_name?.trim() || "—"}</li>
               <li>Email: ${input.contact_email.trim()}</li>
               <li>Phone: ${input.contact_phone?.trim() || "—"}</li>
               <li>Category: ${input.category?.trim() || "—"}</li>
               <li>Location: ${input.location?.trim() || "—"}</li>
             </ul>
             <p><a href="${SITE_URL}/admin/businesses/${data.id}">Review in admin →</a></p>`,
          ),
        })
      : Promise.resolve(),
  ]);

  return { ok: true, data: { business_id: data.id } };
}

/* ------------------------------------------------------------------ public: pay */

/**
 * Start Stripe Checkout for an APPROVED business on the chosen tier. Public by
 * design — the approval email links here so the partner can pay without an
 * account. Only approved, not-yet-active businesses can start checkout.
 */
export async function startPartnerCheckout(
  businessId: string,
  plan: PlanKey,
): Promise<ActionResult<{ url: string }>> {
  if (plan !== "basic" && plan !== "advanced") {
    return { ok: false, error: "Invalid plan" };
  }
  const sb = adminClient();
  const { data: biz, error } = await sb
    .from("businesses")
    .select("id, name, contact_email, status, billing_status")
    .eq("id", businessId)
    .single();

  if (error || !biz) return { ok: false, error: "Business not found" };
  if (biz.status !== "approved") {
    return { ok: false, error: "This application hasn't been approved yet." };
  }
  if (biz.billing_status === "active") {
    return { ok: false, error: "This membership is already active." };
  }

  try {
    const { id: sessionId, url } = await createPartnerCheckout({
      businessId: biz.id,
      contactEmail: biz.contact_email,
      plan,
      siteUrl: SITE_URL,
    });
    // Record the chosen tier now; the webhook confirms it again on payment.
    await sb
      .from("businesses")
      .update({ plan, stripe_checkout_session_id: sessionId, billing_status: "checkout_started" })
      .eq("id", biz.id);
    return { ok: true, data: { url } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Stripe error" };
  }
}

/* ------------------------------------------------------------------ admin: review */

export async function adminSetBusinessStatus(input: {
  business_id: string;
  status: Database["public"]["Enums"]["business_status"];
  admin_note?: string | null;
}): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();

  const { data: biz, error: loadErr } = await sb
    .from("businesses")
    .select("id, name, contact_name, contact_email")
    .eq("id", input.business_id)
    .single();
  if (loadErr || !biz) return { ok: false, error: "Business not found" };

  const patch: Database["public"]["Tables"]["businesses"]["Update"] = {
    status: input.status,
  };
  if (input.admin_note !== undefined) patch.admin_note = input.admin_note;

  const { error } = await sb.from("businesses").update(patch).eq("id", input.business_id);
  if (error) return { ok: false, error: error.message };

  // Notify the partner on approve / reject.
  if (input.status === "approved") {
    await sendEmail({
      to: biz.contact_email,
      subject: "You're approved — activate your Road Panther Perks membership",
      html: emailLayout(
        "You're approved 🎉",
        `<p>Hi ${biz.contact_name || "there"},</p>
         <p><strong>${biz.name}</strong> has been approved as a Road Panther Perks partner.</p>
         <p>Choose your plan and activate your membership to go live —
            Basic (${TIERS.basic.label}, £9/month) or Advanced (${TIERS.advanced.label}, £24/month):</p>
         <p><a href="${SITE_URL}/partners/pay/${biz.id}"
               style="display:inline-block;background:#f5b301;color:#111;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none;">
            Choose your plan →</a></p>
         <p style="color:#888;font-size:13px;">If the button doesn't work, paste this into your browser:<br>${SITE_URL}/partners/pay/${biz.id}</p>`,
      ),
    });
  } else if (input.status === "rejected") {
    await sendEmail({
      to: biz.contact_email,
      subject: "Update on your Road Panther Perks application",
      html: emailLayout(
        "About your application",
        `<p>Hi ${biz.contact_name || "there"},</p>
         <p>Thanks for your interest in Road Panther Perks. On this occasion we're not able to move forward with <strong>${biz.name}</strong>.</p>
         <p>If you think this was a mistake, just reply to this email.</p>`,
      ),
    });
  }

  return { ok: true };
}

export async function adminUpdateBusiness(input: {
  business_id: string;
  name?: string;
  contact_name?: string | null;
  contact_email?: string;
  contact_phone?: string | null;
  website?: string | null;
  category?: string | null;
  location?: string | null;
  description?: string | null;
  admin_note?: string | null;
}): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();

  const patch: Database["public"]["Tables"]["businesses"]["Update"] = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.contact_name !== undefined) patch.contact_name = input.contact_name;
  if (input.contact_email !== undefined) patch.contact_email = input.contact_email;
  if (input.contact_phone !== undefined) patch.contact_phone = input.contact_phone;
  if (input.website !== undefined) patch.website = input.website;
  if (input.category !== undefined) patch.category = input.category;
  if (input.location !== undefined) patch.location = input.location;
  if (input.description !== undefined) patch.description = input.description;
  if (input.admin_note !== undefined) patch.admin_note = input.admin_note;

  if (Object.keys(patch).length === 0) return { ok: true };
  const { error } = await sb.from("businesses").update(patch).eq("id", input.business_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Manual fallback if you take payment outside Stripe or need to flip status by hand. */
export async function adminSetBillingStatus(input: {
  business_id: string;
  billing_status: Database["public"]["Enums"]["billing_status"];
}): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();
  const { error } = await sb
    .from("businesses")
    .update({ billing_status: input.billing_status })
    .eq("id", input.business_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------------ admin: perks */

export type PerkInput = {
  id?: string;
  business_id: string;
  category_id?: string | null;
  title: string;
  summary?: string | null;
  description?: string | null;
  discount_label?: string | null;
  terms?: string | null;
  redemption_type?: string;
  code?: string | null;
  link?: string | null;
  location_label?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

export async function adminUpsertPerk(input: PerkInput): Promise<ActionResult<{ id: string }>> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  if (!input.title?.trim()) return { ok: false, error: "Title is required" };
  const sb = adminClient();

  // Enforce the tier's offer limit when adding a NEW perk (Basic = 1, Advanced = 3).
  if (!input.id) {
    const [{ data: biz }, { count }] = await Promise.all([
      sb.from("businesses").select("plan").eq("id", input.business_id).single(),
      sb.from("perks").select("id", { count: "exact", head: true }).eq("business_id", input.business_id),
    ]);
    const limit = resolveTier(biz?.plan).offers;
    if ((count ?? 0) >= limit) {
      return {
        ok: false,
        error: `This partner's plan allows ${limit} offer${limit === 1 ? "" : "s"}. Upgrade to Advanced for up to ${TIERS.advanced.offers}.`,
      };
    }
  }

  const row: Database["public"]["Tables"]["perks"]["Insert"] = {
    business_id: input.business_id,
    category_id: input.category_id ?? null,
    title: input.title.trim(),
    summary: input.summary ?? null,
    description: input.description ?? null,
    discount_label: input.discount_label ?? null,
    terms: input.terms ?? null,
    redemption_type: input.redemption_type ?? "code",
    code: input.code ?? null,
    link: input.link ?? null,
    location_label: input.location_label ?? null,
    is_active: input.is_active ?? false,
    sort_order: input.sort_order ?? 0,
  };

  if (input.id) {
    const { error } = await sb.from("perks").update(row).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: input.id } };
  }

  const { data, error } = await sb.from("perks").insert(row).select("id").single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not save perk" };
  return { ok: true, data: { id: data.id } };
}

export async function adminDeletePerk(perkId: string): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();
  const { error } = await sb.from("perks").delete().eq("id", perkId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/* ------------------------------------------------------------------ driver signup alert */

/**
 * Fire-and-forget admin alert when a new driver signs up. Called from the signup
 * page right after auth.signUp succeeds. Best-effort; never blocks signup.
 * (Supabase Auth already emails the driver their confirmation link.)
 */
export async function notifyAdminNewDriver(input: {
  name: string;
  email: string;
}): Promise<void> {
  if (!ADMIN_NOTIFY_EMAIL) return;
  await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `New driver signup: ${input.name}`,
    html: emailLayout(
      "New driver signup",
      `<p><strong>${input.name}</strong> (${input.email}) just signed up and is awaiting review.</p>
       <p><a href="${SITE_URL}/admin">Open the admin dashboard →</a></p>`,
    ),
  });
}
