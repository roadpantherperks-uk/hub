export type BusinessStatus = "pending" | "approved" | "rejected" | "suspended";
export type BillingStatus =
  | "none"
  | "checkout_started"
  | "active"
  | "past_due"
  | "canceled";

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  const cfg = {
    pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    approved: { label: "Approved", cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-300 border-red-500/30" },
    suspended: { label: "Suspended", cls: "bg-gray-500/15 text-gray-300 border-gray-500/30" },
  }[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export function BillingBadge({ status }: { status: BillingStatus }) {
  const cfg = {
    none: { label: "—", cls: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    checkout_started: { label: "Checkout started", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    active: { label: "Active", cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    past_due: { label: "Past due", cls: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
    canceled: { label: "Canceled", cls: "bg-red-500/15 text-red-300 border-red-500/30" },
  }[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
