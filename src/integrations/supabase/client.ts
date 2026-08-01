"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

function ensureEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    const missing = [
      ...(!url ? ["NEXT_PUBLIC_SUPABASE_URL"] : []),
      ...(!key ? ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] : []),
    ].join(", ");
    throw new Error(`Missing Supabase env var(s): ${missing}`);
  }
  return { url, key };
}

let _client: ReturnType<typeof createBrowserClient<Database>> | undefined;

function browser() {
  if (!_client) {
    const { url, key } = ensureEnv();
    _client = createBrowserClient<Database>(url, key);
  }
  return _client;
}

// Lazy proxy — avoids env reads at import time.
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_, prop, receiver) {
    return Reflect.get(browser(), prop, receiver);
  },
});
