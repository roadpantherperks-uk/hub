"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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
      <header className="glass-strong border-b border-border/40 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xs font-bold tracking-[0.2em] text-primary border-l border-border/60 pl-3 ml-1">
              ADMIN
            </span>
          </div>
          <Button onClick={logout} variant="outline_glow" size="sm">
            <LogOut className="size-4" /> Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
