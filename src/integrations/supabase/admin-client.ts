import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client. Bypasses RLS — server-only, never import from a
 * client component. Used by admin actions, public data fetchers (which return
 * only safe columns) and Stripe/webhook handlers.
 */
export function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set on the server",
    );
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
