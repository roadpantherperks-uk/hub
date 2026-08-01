"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Users, UserPlus, CheckCircle2, Clock, Building2, Tag, CreditCard, TrendingUp,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { resolveTier, poundsLabel } from "@/lib/tiers";
import { PageHeading, StatCard, Panel, Loading, Empty } from "@/components/admin/AdminUI";

type Counts = {
  driversTotal: number;
  driversPending: number;
  driversApproved: number;
  newToday: number;
  newWeek: number;
  newMonth: number;
  bizTotal: number;
  bizPending: number;
  bizApproved: number;
  bizPaying: number;
  perksTotal: number;
  perksLive: number;
  mrrPence: number;
};

type PendingItem = { id: string; label: string; sub: string; href: string };

export default function AdminOverview() {
  const [c, setC] = useState<Counts | null>(null);
  const [queue, setQueue] = useState<PendingItem[]>([]);

  useEffect(() => {
    (async () => {
      const [d, b, p] = await Promise.all([
        supabase.from("drivers").select("id, first_name, surname, status, created_at"),
        supabase.from("businesses").select("id, name, category, status, billing_status, plan, created_at"),
        supabase.from("perks").select("id, is_active"),
      ]);
      if (d.error || b.error || p.error) {
        toast.error((d.error ?? b.error ?? p.error)!.message);
      }

      const drivers = d.data ?? [];
      const businesses = b.data ?? [];
      const perks = p.data ?? [];

      const now = Date.now();
      const since = (days: number) => now - days * 86_400_000;
      const newer = (rows: { created_at: string }[], ms: number) =>
        rows.filter((r) => new Date(r.created_at).getTime() >= ms).length;

      // Real MRR: what active partners are actually billed at, not a projection.
      const mrrPence = businesses
        .filter((x) => x.billing_status === "active")
        .reduce((sum, x) => sum + resolveTier(x.plan).pence, 0);

      setC({
        driversTotal: drivers.length,
        driversPending: drivers.filter((x) => x.status === "pending").length,
        driversApproved: drivers.filter((x) => x.status === "approved").length,
        newToday: newer(drivers, since(1)),
        newWeek: newer(drivers, since(7)),
        newMonth: newer(drivers, since(30)),
        bizTotal: businesses.length,
        bizPending: businesses.filter((x) => x.status === "pending").length,
        bizApproved: businesses.filter((x) => x.status === "approved").length,
        bizPaying: businesses.filter((x) => x.billing_status === "active").length,
        perksTotal: perks.length,
        perksLive: perks.filter((x) => x.is_active).length,
        mrrPence,
      });

      setQueue([
        ...businesses
          .filter((x) => x.status === "pending")
          .map((x) => ({
            id: `b-${x.id}`,
            label: x.name,
            sub: `Business application · ${x.category ?? "uncategorised"}`,
            href: `/admin/businesses/${x.id}`,
          })),
        ...drivers
          .filter((x) => x.status === "pending")
          .map((x) => ({
            id: `d-${x.id}`,
            label: `${x.first_name} ${x.surname}`.trim(),
            sub: "Road professional awaiting verification",
            href: `/admin/drivers/${x.id}?source=drivers`,
          })),
      ]);
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeading title="Overview" subtitle="Everything at a glance" />

      {c === null ? (
        <Panel><Loading /></Panel>
      ) : (
        <>
          <Section title="Members">
            <StatCard icon={Users} label="Total members" value={c.driversTotal} />
            <StatCard icon={CheckCircle2} label="Active members" value={c.driversApproved} accent="success" />
            <StatCard icon={Clock} label="Awaiting approval" value={c.driversPending} accent="warning" />
            <StatCard
              icon={UserPlus}
              label="New signups"
              value={c.newMonth}
              hint={`${c.newToday} today · ${c.newWeek} this week · ${c.newMonth} this month`}
            />
          </Section>

          <Section title="Businesses & offers">
            <StatCard icon={Building2} label="Partner businesses" value={c.bizTotal} />
            <StatCard icon={Clock} label="Awaiting approval" value={c.bizPending} accent="warning" />
            <StatCard icon={CheckCircle2} label="Approved" value={c.bizApproved} accent="success" />
            <StatCard icon={Tag} label="Offers live" value={c.perksLive} hint={`${c.perksTotal} total, incl. drafts`} />
          </Section>

          <Section title="Revenue">
            <StatCard icon={CreditCard} label="Paying partners" value={c.bizPaying} accent="success" />
            <StatCard
              icon={TrendingUp}
              label="MRR"
              value={poundsLabel(c.mrrPence)}
              hint="Active subscriptions at their plan price"
            />
          </Section>

          <Panel title="Needs your attention" subtitle="Applications waiting on a decision">
            {queue.length === 0 ? (
              <Empty icon={CheckCircle2} label="Nothing waiting — you're all caught up." />
            ) : (
              <ul className="divide-y divide-border/20">
                {queue.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{item.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.sub}</div>
                    </div>
                    <Button asChild size="sm" variant="outline_glow">
                      <Link href={item.href}>
                        Review <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}
