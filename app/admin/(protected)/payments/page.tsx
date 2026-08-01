"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { resolveTier, poundsLabel } from "@/lib/tiers";
import { BillingBadge, type BillingStatus } from "@/components/BusinessBadges";
import {
  PageHeading, StatCard, Panel, Loading, Empty, Table, Th, Td, Tr,
} from "@/components/admin/AdminUI";

/**
 * Subscription status per partner, driven by what Stripe has told us via the
 * webhook. Invoice history, refunds and revenue-over-time need the Stripe
 * objects mirrored into our own tables — that's Phase 5, not here. This page
 * deliberately shows only what we can state accurately today.
 */

type Row = {
  id: string;
  name: string;
  contact_email: string;
  plan: string | null;
  status: string;
  billing_status: BillingStatus;
  stripe_subscription_id: string | null;
  created_at: string;
};

export default function AdminPayments() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, contact_email, plan, status, billing_status, stripe_subscription_id, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data as Row[] | null) ?? []);
    })();
  }, []);

  const active = rows?.filter((r) => r.billing_status === "active") ?? [];
  const failing = rows?.filter((r) => r.billing_status === "past_due") ?? [];
  const mrrPence = active.reduce((sum, r) => sum + resolveTier(r.plan).pence, 0);

  // Approved partners who never completed checkout — the follow-up list.
  const unpaid =
    rows?.filter((r) => r.status === "approved" && r.billing_status !== "active") ?? [];

  return (
    <div className="space-y-8">
      <PageHeading title="Payments" subtitle="Partner subscriptions and billing status" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="MRR" value={poundsLabel(mrrPence)} />
        <StatCard icon={CreditCard} label="Active" value={active.length} accent="success" />
        <StatCard icon={AlertTriangle} label="Failed payments" value={failing.length} accent="destructive" />
        <StatCard
          icon={AlertTriangle}
          label="Approved, unpaid"
          value={unpaid.length}
          accent="warning"
          hint="Approved but never completed checkout"
        />
      </div>

      <Panel title="Subscriptions" subtitle="One row per business, newest first">
        {rows === null ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty icon={CreditCard} label="No businesses yet." />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-border/40">
                <Th>Business</Th>
                <Th>Plan</Th>
                <Th>Monthly</Th>
                <Th>Billing</Th>
                <Th>Stripe</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const tier = resolveTier(r.plan);
                return (
                  <Tr key={r.id}>
                    <Td>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.contact_email}</div>
                    </Td>
                    <Td>{tier.label}</Td>
                    <Td className="font-mono text-xs">
                      {r.billing_status === "active" ? poundsLabel(tier.pence) : "—"}
                    </Td>
                    <Td><BillingBadge status={r.billing_status} /></Td>
                    <Td className="font-mono text-[11px] text-muted-foreground">
                      {r.stripe_subscription_id ?? "—"}
                    </Td>
                    <Td>
                      <Button asChild size="sm" variant="outline_glow">
                        <Link href={`/admin/businesses/${r.id}`}>
                          <Eye className="size-3.5" /> View
                        </Link>
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Panel>

      <p className="text-xs text-muted-foreground">
        Invoice history, refunds and revenue over time need Stripe&apos;s records mirrored into
        our own tables — that lands with the subscriptions work, not before.
      </p>
    </div>
  );
}
