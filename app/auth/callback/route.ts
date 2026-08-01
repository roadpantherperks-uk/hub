import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/integrations/supabase/server";

/**
 * Handles Supabase email-confirm + password-reset + magic-link callbacks.
 * Exchanges the auth code for a session, then redirects to ?next=...
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const sb = await getSupabaseServerClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
