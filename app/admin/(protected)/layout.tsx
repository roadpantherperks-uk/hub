"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Loader2,
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  CreditCard,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * Sidebar shell: sections on the left, the selected one on the right.
 *
 * Only sections backed by real data are listed. The client's spec also names
 * Analytics, Notifications, Communications and Platform Settings — those have
 * nothing behind them yet, and an empty screen behind a nav item reads worse
 * than no nav item, so they're added when their features land.
 */

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/drivers", label: "Road Professionals", icon: Users },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/perks", label: "Perks & Offers", icon: Tag },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        if (!cancelled) router.replace("/admin/login");
        return;
      }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        await supabase.auth.signOut();
        if (!cancelled) router.replace("/admin/login");
        return;
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setNavOpen(false), [pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="animate-spin text-primary size-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong border-b border-border/40 sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              className="lg:hidden grid place-items-center size-9 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label={navOpen ? "Close menu" : "Open menu"}
            >
              {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Logo />
            <span className="hidden sm:inline text-xs font-bold tracking-[0.2em] text-primary border-l border-border/60 pl-3">
              ADMIN
            </span>
          </div>
          <Button onClick={logout} variant="outline_glow" size="sm">
            <LogOut className="size-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 border-r border-border/40 min-h-[calc(100vh-4rem)] sticky top-16 self-start">
          <SideNav pathname={pathname} />
        </aside>

        {/* Mobile drawer */}
        {navOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 top-16 z-40 bg-black/60"
              onClick={() => setNavOpen(false)}
            />
            <aside className="lg:hidden fixed top-16 left-0 bottom-0 z-40 w-64 glass-strong border-r border-border/40 overflow-y-auto">
              <SideNav pathname={pathname} />
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0 px-4 sm:px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

function SideNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="p-3 space-y-1">
      {NAV.map((item) => {
        // Overview must match exactly, or every child route would light it up.
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : (pathname?.startsWith(item.href) ?? false);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
            }`}
          >
            <item.icon className={`size-4 shrink-0 ${active ? "text-primary" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
