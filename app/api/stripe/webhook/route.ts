import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/integrations/stripe";
import { adminClient } from "@/integrations/supabase/admin-client";
import { sendEmail, emailLayout, escapeHtml, ADMIN_NOTIFY_EMAIL } from "@/integrations/email";

// Stripe needs the raw body for signature verification, so no parsing/caching.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BillingStatus = "active" | "past_due" | "canceled" | "checkout_started";

async function setBilling(
  match: { column: "id" | "stripe_subscription_id" | "stripe_customer_id"; value: string },
  billing_status: BillingStatus,
  extra?: { stripe_customer_id?: string; stripe_subscription_id?: string },
) {
  const sb = adminClient();
  const { data } = await sb
    .from("businesses")
    .update({ billing_status, ...(extra ?? {}) })
    .eq(match.column, match.value)
    .select("id, name, contact_email")
    .maybeSingle();
  return data;
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Record<string, unknown>;
  try {
    event = await constructWebhookEvent(payload, sig);
  } catch (err) {
    console.error("[stripe webhook] verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const type = event.type as string;
  const object = (event.data as { object: Record<string, unknown> } | undefined)?.object ?? {};

  try {
    switch (type) {
      case "checkout.session.completed": {
        const businessId =
          (object.client_reference_id as string | undefined) ??
          ((object.metadata as Record<string, string> | undefined)?.business_id);
        const customerId = object.customer as string | undefined;
        const subscriptionId = object.subscription as string | undefined;
        if (businessId) {
          const biz = await setBilling({ column: "id", value: businessId }, "active", {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          });
          if (biz) {
            await Promise.allSettled([
              sendEmail({
                to: biz.contact_email,
                subject: "Your Road Panther Perks membership is live",
                html: emailLayout(
                  "You're live 🎉",
                  `<p>Hi,</p><p><strong>${escapeHtml(biz.name)}</strong> is now an active Road Panther Perks partner. Welcome aboard!</p>`,
                ),
              }),
              ADMIN_NOTIFY_EMAIL
                ? sendEmail({
                    to: ADMIN_NOTIFY_EMAIL,
                    subject: `💷 Payment received: ${biz.name}`,
                    html: emailLayout(
                      "Partner activated",
                      `<p><strong>${escapeHtml(biz.name)}</strong> completed checkout and is now active.</p>`,
                    ),
                  })
                : Promise.resolve(),
            ]);
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const subId = object.subscription as string | undefined;
        if (subId) await setBilling({ column: "stripe_subscription_id", value: subId }, "past_due");
        break;
      }
      case "customer.subscription.deleted": {
        const subId = object.id as string | undefined;
        if (subId) await setBilling({ column: "stripe_subscription_id", value: subId }, "canceled");
        break;
      }
      default:
        // Unhandled event types are fine — acknowledge so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${type}:`, err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
