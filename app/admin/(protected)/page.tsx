"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Plus,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, type SignupStatus } from "@/components/StatusBadge";

type Driver = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  driver_type: string;
  location: string;
  status: SignupStatus;
  created_at: string;
};

type WaitlistRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  driver_type: string;
  location: string;
  status: SignupStatus;
  created_at: string;
};

type Tab = "drivers" | "waitlist";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("drivers");
  const [drivers, setDrivers] = useState<Driver[] | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const [d, w] = await Promise.all([
        supabase
          .from("drivers")
          .select("id, first_name, surname, email, phone, driver_type, location, status, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("driver_signups")
          .select("id, full_name, email, phone, driver_type, location, status, created_at")
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage driver accounts and waitlist applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline_glow">
            <Link href="/admin/businesses">
              <Building2 className="size-4" />
              Businesses
            </Link>
          </Button>
          <Button asChild variant="hero">
            <Link href="/admin/drivers/new">
              <Plus className="size-4" />
              Add driver
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats — drivers first, waitlist as a smaller summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total drivers" value={driverStats.total} />
        <StatCard
          icon={Clock}
          label="Pending"
          value={driverStats.pending}
          accent="warning"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={driverStats.approved}
          accent="success"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={driverStats.rejected}
          accent="destructive"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 hairline-b">
        <TabButton active={tab === "drivers"} onClick={() => setTab("drivers")}>
          Drivers ({driverStats.total})
        </TabButton>
        <TabButton active={tab === "waitlist"} onClick={() => setTab("waitlist")}>
          Waitlist ({waitlistStats.total})
        </TabButton>
      </div>

      {tab === "drivers" ? (
        <DriversTable rows={drivers} />
      ) : (
        <WaitlistTable rows={waitlist} />
      )}
    </div>
  );
}

function DriversTable({ rows }: { rows: Driver[] | null }) {
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border/40">
        <h2 className="font-display font-bold text-xl">Driver accounts</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Real accounts (signed up via /signup, can log in)
        </p>
      </div>
      {rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty label="No driver accounts yet. Drivers can sign up at /signup." />
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
              <tr
                key={r.id}
                className="border-b border-border/20 hover:bg-primary/5 transition-colors"
              >
                <Td>
                  <div className="font-semibold">
                    {r.first_name} {r.surname}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </Td>
                <Td>{r.driver_type}</Td>
                <Td>{r.location}</Td>
                <Td className="font-mono text-xs">{r.phone}</Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
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
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function WaitlistTable({ rows }: { rows: WaitlistRow[] | null }) {
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border/40">
        <h2 className="font-display font-bold text-xl">Waitlist</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Marketing signups via /join — pre-account
        </p>
      </div>
      {rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty label="No waitlist signups yet." />
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
              <tr
                key={r.id}
                className="border-b border-border/20 hover:bg-primary/5 transition-colors"
              >
                <Td>
                  <div className="font-semibold">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </Td>
                <Td>{r.driver_type}</Td>
                <Td>{r.location}</Td>
                <Td className="font-mono text-xs">{r.phone}</Td>
                <Td>
                  <StatusBadge status={r.status} />
                </Td>
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
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function countByStatus<T extends { status: SignupStatus }>(rows: T[] | null) {
  return {
    total: rows?.length ?? 0,
    pending: rows?.filter((r) => r.status === "pending").length ?? 0,
    approved: rows?.filter((r) => r.status === "approved").length ?? 0,
    rejected: rows?.filter((r) => r.status === "rejected").length ?? 0,
  };
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Loading() {
  return (
    <div className="p-12 grid place-items-center">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="p-12 text-center text-muted-foreground">
      <Users className="size-12 mx-auto mb-3 opacity-40" />
      {label}
    </div>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent?: "warning" | "success" | "destructive";
}) {
  const colorMap = {
    warning: "from-yellow-500 to-orange-500",
    success: "from-green-500 to-emerald-500",
    destructive: "from-red-500 to-rose-500",
  };
  return (
    <div className="glass rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display font-black text-3xl mt-1">{value}</div>
        </div>
        <div
          className={`size-11 rounded-xl grid place-items-center ${
            accent ? `bg-gradient-to-br ${colorMap[accent]}` : "bg-gradient-primary"
          }`}
        >
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left px-6 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}
