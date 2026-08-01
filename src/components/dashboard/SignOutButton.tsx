"use client";

import { useTransition } from "react";
import { signOut } from "@/integrations/supabase/auth-actions";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => signOut())}
      disabled={pending}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sign out
    </button>
  );
}
