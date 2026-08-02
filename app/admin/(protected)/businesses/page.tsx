"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Building2, Clock, CheckCircle2, CreditCard, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { displayBusinessCategory } from "@/lib/options";
import { adminDeleteBusiness } from "@/integrations/supabase/partner-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  BusinessStatusBadge,
  BillingBadge,
  type BusinessStatus,
  type BillingStatus,
} from "@/components/BusinessBadges";

type Business = {
  id: string;
  name: string;
  contact_email: string;
  category: string | null;
  category_other: string | null;
  location: string | null;
  status: BusinessStatus;
  billing_status: BillingStatus;
  created_at: string;
};

type Tab = "applications" | "partners";

export default function AdminBusinesses() {
  const [tab, setTab] = useState<Tab>("applications");
  const [rows, setRows] = useState<Business[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, contact_email, category, category_other, location, status, billing_status, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data as Business[] | null) ?? []);
    })();
  }, []);

  const applications = rows?.filter((r) => r.status === "pending") ?? [];
  const partners = rows?.filter((r) => r.status !== "pending") ?? [];
  const activeCount = rows?.filter((r) => r.billing_status === "active").length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl">Businesses</h1>
          <p className="text-muted-foreground mt-1">
            Partner applications, approvals and membership status
          </p>
        </div>
        <Button asChild variant="hero">
          <Link href="/admin/businesses/new">
            <Plus className="size-4" /> Add business
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total" value={rows?.length ?? 0} />
        <StatCard icon={Clock} label="Applications" value={applications.length} accent="warning" />
        <StatCard icon={CheckCircle2} label="Approved" value={partners.filter((p) => p.status === "approved").length} accent="success" />
        <StatCard icon={CreditCard} label="Paying" value={activeCount} accent="success" />
      </div>

      <div className="flex items-center gap-2 hairline-b">
        <TabButton active={tab === "applications"} onClick={() => setTab("applications")}>
          Applications ({applications.length})
        </TabButton>
        <TabButton active={tab === "partners"} onClick={() => setTab("partners")}>
          Partners ({partners.length})
        </TabButton>
      </div>

      <BusinessTable
        rows={rows === null ? null : tab === "applications" ? applications : partners}
        onDeleted={(id) => setRows((prev) => prev?.filter((r) => r.id !== id) ?? null)}
      />
    </div>
  );
}

function DeleteBusiness({
  business,
  onDeleted,
}: {
  business: Business;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const confirm = async () => {
    setBusy(true);
    const res = await adminDeleteBusiness(business.id);
    setBusy(false);
    if (!res.ok) {
      // Keep the dialog open so the reason stays on screen.
      toast.error(res.error);
      return;
    }
    setOpen(false);
    onDeleted(business.id);
    toast.success(`${business.name} deleted`);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline_glow"
          className="text-destructive hover:text-destructive"
          aria-label={`Delete ${business.name}`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {business.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the business and every offer attached to it. It
            can&apos;t be undone. Nothing is cancelled at Stripe — do that separately if
            they ever paid.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Handle the async result ourselves rather than letting Radix close first.
              e.preventDefault();
              void confirm();
            }}
            disabled={busy}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {busy ? <><Loader2 className="size-4 animate-spin" /> Deleting…</> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BusinessTable({
  rows,
  onDeleted,
}: {
  rows: Business[] | null;
  onDeleted: (id: string) => void;
}) {
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      {rows === null ? (
        <div className="p-12 grid place-items-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Building2 className="size-12 mx-auto mb-3 opacity-40" />
          Nothing here yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <Th>Business</Th>
                <Th>Category</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th>Billing</Th>
                <Th>Applied</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.contact_email}</div>
                  </td>
                  <td className="px-6 py-4">{displayBusinessCategory(r.category, r.category_other)}</td>
                  <td className="px-6 py-4">{r.location ?? "—"}</td>
                  <td className="px-6 py-4"><BusinessStatusBadge status={r.status} /></td>
                  <td className="px-6 py-4"><BillingBadge status={r.billing_status} /></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline_glow">
                        <Link href={`/admin/businesses/${r.id}`}>
                          <Eye className="size-3.5" /> View
                        </Link>
                      </Button>
                      <DeleteBusiness business={r} onDeleted={onDeleted} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
  accent?: "warning" | "success";
}) {
  const colorMap = { warning: "from-yellow-500 to-orange-500", success: "from-green-500 to-emerald-500" };
  return (
    <div className="glass rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display font-black text-3xl mt-1">{value}</div>
        </div>
        <div className={`size-11 rounded-xl grid place-items-center ${accent ? `bg-gradient-to-br ${colorMap[accent]}` : "bg-gradient-primary"}`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left px-6 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{children}</th>;
}
