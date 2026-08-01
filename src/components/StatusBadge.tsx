export type SignupStatus = "pending" | "approved" | "rejected";

export function StatusBadge({ status }: { status: SignupStatus }) {
  const cfg = {
    pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
    approved: { label: "Approved", cls: "bg-green-500/15 text-green-300 border-green-500/30" },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-300 border-red-500/30" },
  }[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
