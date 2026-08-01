import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — middleware will handle the refresh
        }
      },
    },
  });
}

/**
 * Returns the current authenticated user (or null).
 * Use in server components and route handlers.
 */
export async function getSessionUser() {
  const sb = await getSupabaseServerClient();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user;
}

/**
 * Returns true if the current user has the given app_role.
 */
export async function hasRole(role: "admin" | "driver" | "business" | "user") {
  const user = await getSessionUser();
  if (!user) return false;
  const sb = await getSupabaseServerClient();
  const { data } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", role)
    .maybeSingle();
  return !!data;
}
