"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, Clock, CheckCircle2, XCircle, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, type SignupStatus } from "@/components/StatusBadge";
import { displayDriverType, displayLocation } from "@/lib/options";
import {
  PageHeading, StatCard, Panel, Loading, Empty, Table, Th, Td, Tr, TabButton,
} from "@/components/admin/AdminUI";

type Driver = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  driver_type: string;
  driver_type_other: string | null;
  location: string;
  location_other: string | null;
  status: SignupStatus;
  created_at: string;
};

type WaitlistRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  driver_type: string;
  driver_type_other: string | null;
  location: string;
  location_other: string | null;
  status: SignupStatus;
  created_at: string;
};

type Tab = "drivers" | "waitlist";

export default function AdminDrivers() {
  const [tab, setTab] = useState<Tab>("drivers");
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const [d, w] = await Promise.all([
        supabase
          .from("drivers")
          .select(
            "id, first_name, surname, email, phone, driver_type, driver_type_other, location, location_other, status, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("driver_signups")
          .select(
            "id, full_name, email, phone, driver_type, driver_type_other, location, location_other, status, created_at",
          )
          .order("created_at", { ascending: false }),
      ]);
      if (d.error) toast.error(`Drivers: ${d.error.message}`);
      if (w.error) toast.error(`Waitlist: ${w.error.message}`);
      setDrivers((d.data as Driver[] | null) ?? []);
      setWaitlist((w.data as WaitlistRow[] | null) ?? []);
    })();
  }, []);

  const driverStats = countByStatus(drivers);
  const waitlistStats = countByStatus(waitlist);

  return (
    <div className="space-y-8">
      <PageHeading
        title="Road Professionals"
        subtitle="Member accounts and waitlist signups"
        actions={
          <Button asChild variant="hero">
            <Link href="/admin/drivers/new">
              <Plus className="size-4" /> Add member
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total members" value={driverStats.total} />
        <StatCard icon={Clock} label="Pending" value={driverStats.pending} accent="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={driverStats.approved} accent="success" />
        <StatCard icon={XCircle} label="Rejected" value={driverStats.rejected} accent="destructive" />
      </div>

      <div className="flex items-center gap-2 hairline-b">
        <TabButton active={tab === "drivers"} onClick={() => setTab("drivers")}>
          Members ({driverStats.total})
        </TabButton>
        <TabButton active={tab === "waitlist"} onClick={() => setTab("waitlist")}>
          Waitlist ({waitlistStats.total})
        </TabButton>
      </div>

      {tab === "drivers" ? <DriversTable rows={drivers} /> : <WaitlistTable rows={waitlist} />}
    </div>
  );
}

function DriversTable({ rows }: { rows: Driver[] | null }) {
  return (
    <Panel title="Member accounts" subtitle="Real accounts (signed up via /signup, can log in)">
      {rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty icon={Users} label="No member accounts yet. Road professionals can sign up at /signup." />
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Location</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <div className="font-semibold">{r.first_name} {r.surname}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </Td>
                <Td>{displayDriverType(r.driver_type, r.driver_type_other)}</Td>
                <Td>{displayLocation(r.location, r.location_other)}</Td>
                <Td className="font-mono text-xs">{r.phone}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </Td>
                <Td>
                  <Button asChild size="sm" variant="outline_glow">
                    <Link href={`/admin/drivers/${r.id}?source=drivers`}>
                      <Eye className="size-3.5" /> View
                    </Link>
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Panel>
  );
}

function WaitlistTable({ rows }: { rows: WaitlistRow[] | null }) {
  return (
    <Panel title="Waitlist" subtitle="Marketing signups via /join — pre-account">
      {rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty icon={Users} label="No waitlist signups yet." />
      ) : (
        <Table>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Location</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <div className="font-semibold">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </Td>
                <Td>{displayDriverType(r.driver_type, r.driver_type_other)}</Td>
                <Td>{displayLocation(r.location, r.location_other)}</Td>
                <Td className="font-mono text-xs">{r.phone}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </Td>
                <Td>
                  <Button asChild size="sm" variant="outline_glow">
                    <Link href={`/admin/drivers/${r.id}?source=waitlist`}>
                      <Eye className="size-3.5" /> View
                    </Link>
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Panel>
  );
}

function countByStatus<T extends { status: SignupStatus }>(rows: T[] | null) {
  return {
    total: rows?.length ?? 0,
    pending: rows?.filter((r) => r.status === "pending").length ?? 0,
    approved: rows?.filter((r) => r.status === "approved").length ?? 0,
    rejected: rows?.filter((r) => r.status === "rejected").length ?? 0,
  };
}
