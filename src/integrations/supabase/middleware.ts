import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

/**
 * Refreshes the user session on every request and propagates updated cookies.
 * Call this from `middleware.ts` at the app root.
 *
 * Fails safe: if the Supabase env vars are missing (e.g. not configured in the
 * host yet) or the auth call throws, we pass the request through unauthenticated
 * rather than 500-ing every route. Auth-gated pages do their own server-side
 * check, so the worst case is a user appears logged out — never a dead site.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // No config → skip session refresh instead of throwing (would break all routes).
  if (!url || !key) {
    console.error(
      "[middleware] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — skipping session refresh.",
    );
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    // Touches the session — refreshes tokens if needed.
    await supabase.auth.getUser();
  } catch (err) {
    console.error("[middleware] session refresh failed:", err);
  }

  return supabaseResponse;
}
