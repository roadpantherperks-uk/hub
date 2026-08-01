"use client";

import { Loader2, Inbox, type LucideIcon } from "lucide-react";

/**
 * Shared admin primitives. Every admin section renders the same stat tiles and
 * tables, so they live here rather than being copied per page.
 */

export function PageHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display font-black text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const ACCENTS = {
  warning: "from-yellow-500 to-orange-500",
  success: "from-green-500 to-emerald-500",
  destructive: "from-red-500 to-rose-500",
} as const;

export type StatAccent = keyof typeof ACCENTS;

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: StatAccent;
  hint?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display font-black text-3xl mt-1 truncate">{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div
          className={`size-11 shrink-0 rounded-xl grid place-items-center ${
            accent ? `bg-gradient-to-br ${ACCENTS[accent]}` : "bg-gradient-primary"
          }`}
        >
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      {title && (
        <div className="p-6 border-b border-border/40">
          <h2 className="font-display font-bold text-xl">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <div className="p-12 grid place-items-center">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );
}

export function Empty({ label, icon: Icon = Inbox }: { label: string; icon?: LucideIcon }) {
  return (
    <div className="p-12 text-center text-muted-foreground">
      <Icon className="size-12 mx-auto mb-3 opacity-40" />
      {label}
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left px-6 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-border/20 hover:bg-primary/5 transition-colors">{children}</tr>
  );
}

export function TabButton({
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
