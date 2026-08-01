import "server-only";

import { TIERS, type PlanKey } from "@/lib/tiers";

/**
 * Stripe via REST (no SDK). Uses STRIPE_SECRET_KEY.
 *
 * Partner tiers (Basic £9 / Advanced £24) are billed as monthly subscriptions
 * with inline pricing, so the only value you must set is STRIPE_SECRET_KEY —
 * no Prices to create in the dashboard first.
 *
 * Env:
 *   STRIPE_SECRET_KEY       — sk_test_... / sk_live_...
 *   STRIPE_WEBHOOK_SECRET   — whsec_... (for /api/stripe/webhook signature check)
 *   NEXT_PUBLIC_SITE_URL    — for success/cancel redirects
 */

const STRIPE_API = "https://api.stripe.com/v1";

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

/** Encode nested params the way Stripe's form API expects (a[b][c]=v). */
function toForm(obj: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") {
      parts.push(...toForm(v as Record<string, unknown>, key));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts;
}

async function stripePost(path: string, params: Record<string, unknown>) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toForm(params).join("&"),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Stripe error ${res.status}`);
  }
  return json;
}

export type CheckoutArgs = {
  businessId: string;
  contactEmail: string;
  plan: PlanKey;
  siteUrl: string;
};

/**
 * Create a subscription Checkout Session for the chosen partner tier.
 * Returns { id, url }. Store the id + plan on the business; the webhook flips
 * billing_status to 'active' when checkout.session.completed arrives.
 */
export async function createPartnerCheckout({
  businessId,
  contactEmail,
  plan,
  siteUrl,
}: CheckoutArgs): Promise<{ id: string; url: string }> {
  const tier = TIERS[plan];
  const session = await stripePost("/checkout/sessions", {
    mode: "subscription",
    customer_email: contactEmail,
    client_reference_id: businessId,
    allow_promotion_codes: "true",
    success_url: `${siteUrl}/partners/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/partners/pay/${businessId}?canceled=1`,
    metadata: { business_id: businessId, plan },
    subscription_data: { metadata: { business_id: businessId, plan } },
    line_items: {
      0: {
        quantity: "1",
        price_data: {
          currency: "gbp",
          unit_amount: String(tier.pence),
          recurring: { interval: "month" },
          product_data: {
            name: `Road Panther Perks — ${tier.label}`,
          },
        },
      },
    },
  });
  return { id: session.id as string, url: session.url as string };
}

/**
 * Verify a Stripe webhook signature (HMAC-SHA256 over `${t}.${payload}`).
 * Avoids the Stripe SDK; uses Node's crypto. Returns the parsed event or throws.
 */
export async function constructWebhookEvent(
  payload: string,
  sigHeader: string | null,
): Promise<Record<string, unknown>> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  if (!sigHeader) throw new Error("Missing stripe-signature header");

  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) throw new Error("Malformed stripe-signature header");

  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Webhook signature verification failed");
  }
  return JSON.parse(payload) as Record<string, unknown>;
}
