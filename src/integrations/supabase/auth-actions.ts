"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "./server";
import { sendEmail, emailLayout, ADMIN_NOTIFY_EMAIL } from "../email";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export type DriverSignupInput = {
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  driver_type: string;
  driver_type_other?: string;
  location: string;
  location_other?: string;
  verification_doc_url: string;
};

export async function signUpDriver(input: DriverSignupInput): Promise<ActionResult> {
  const sb = await getSupabaseServerClient();
  const { error } = await sb.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback?next=/dashboard`,
      data: {
        role: "driver",
        first_name: input.first_name,
        surname: input.surname,
        phone: input.phone,
        driver_type: input.driver_type,
        driver_type_other: input.driver_type_other ?? null,
        location: input.location,
        location_other: input.location_other ?? null,
        verification_doc_url: input.verification_doc_url,
      },
    },
  });
  if (error) return { ok: false, error: error.message };

  // Best-effort admin alert (Supabase already emails the driver their
  // confirmation link). Never blocks signup on email delivery.
  if (ADMIN_NOTIFY_EMAIL) {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    void sendEmail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `New driver signup: ${input.first_name} ${input.surname}`,
      html: emailLayout(
        "New driver signup",
        `<p><strong>${input.first_name} ${input.surname}</strong> (${input.email}) just signed up and is awaiting review.</p>
         <p><a href="${siteUrl}/admin">Open the admin dashboard →</a></p>`,
      ),
    });
  }

  return { ok: true };
}

/**
 * Driver self-update: changes the auth email (triggers a confirmation email
 * to the new address). `drivers.email` syncs via a Postgres trigger after confirm.
 */
export async function updateOwnEmail(newEmail: string): Promise<ActionResult> {
  const sb = await getSupabaseServerClient();
  const { error } = await sb.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${SITE_URL}/auth/callback?next=/dashboard/profile` },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const sb = await getSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const sb = await getSupabaseServerClient();
  await sb.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const sb = await getSupabaseServerClient();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<ActionResult> {
  const sb = await getSupabaseServerClient();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
