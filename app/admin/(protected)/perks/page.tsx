"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tag, CheckCircle2, EyeOff, Building2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  PageHeading, StatCard, Panel, Loading, Empty, Table, Th, Td, Tr, TabButton,
} from "@/components/admin/AdminUI";

/**
 * Every offer across every partner, in one place. Editing still happens on the
 * owning business's page — a perk only makes sense in the context of the
 * business's plan limit, so there's one editor rather than two.
 */

type Row = {
  id: string;
  title: string;
  discount_label: string | null;
  is_active: boolean;
  created_at: string;
  perk_categories: { name: string } | null;
  businesses: { id: string; name: string; status: string } | null;
};

type Tab = "live" | "drafts";

export default function AdminPerks() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [tab, setTab] = useState<Tab>("live");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("perks")
        .select("id, title, discount_label, is_active, created_at, perk_categories ( name ), businesses ( id, name, status )")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data as unknown as Row[] | null) ?? []);
    })();
  }, []);

  const live = rows?.filter((r) => r.is_active) ?? [];
  const drafts = rows?.filter((r) => !r.is_active) ?? [];
  const shown = tab === "live" ? live : drafts;

  return (
    <div className="space-y-8">
      <PageHeading
        title="Perks & Offers"
        subtitle="Every offer across all partner businesses"
        actions={
          <Button asChild variant="outline_glow">
            <Link href="/admin/businesses">
              <Building2 className="size-4" /> Businesses
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Tag} label="Total offers" value={rows?.length ?? 0} />
        <StatCard icon={CheckCircle2} label="Live" value={live.length} accent="success" />
        <StatCard icon={EyeOff} label="Drafts" value={drafts.length} accent="warning" />
      </div>

      <div className="flex items-center gap-2 hairline-b">
        <TabButton active={tab === "live"} onClick={() => setTab("live")}>
          Live ({live.length})
        </TabButton>
        <TabButton active={tab === "drafts"} onClick={() => setTab("drafts")}>
          Drafts ({drafts.length})
        </TabButton>
      </div>

      <Panel>
        {rows === null ? (
          <Loading />
        ) : shown.length === 0 ? (
          <Empty
            icon={Tag}
            label={
              tab === "live"
                ? "No live offers yet. Add one from a business's page and set it active."
                : "No drafts."
            }
          />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-border/40">
                <Th>Offer</Th>
                <Th>Business</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <div className="font-semibold">{r.title}</div>
                    {r.discount_label && (
                      <div className="text-xs text-brand font-medium">{r.discount_label}</div>
                    )}
                  </Td>
                  <Td>
                    {r.businesses ? (
                      <Link
                        href={`/admin/businesses/${r.businesses.id}`}
                        className="hover:text-brand transition-colors"
                      >
                        {r.businesses.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                    {r.businesses && r.businesses.status !== "approved" && (
                      <div className="text-[11px] text-yellow-500">
                        Business not approved — offer is hidden publicly
                      </div>
                    )}
                  </Td>
                  <Td>{r.perk_categories?.name ?? "—"}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        r.is_active
                          ? "bg-green-500/15 text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.is_active ? "Live" : "Draft"}
                    </span>
                  </Td>
                  <Td>
                    {r.businesses && (
                      <Button asChild size="sm" variant="outline_glow">
                        <Link href={`/admin/businesses/${r.businesses.id}`}>
                          <Pencil className="size-3.5" /> Edit
                        </Link>
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
