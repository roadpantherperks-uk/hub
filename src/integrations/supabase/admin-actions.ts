"use server";

import { adminClient } from "./admin-client";
import { hasRole } from "./server";
import type { Database } from "./types";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export type AdminCreateDriverInput = {
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  driver_type: string;
  driver_type_other?: string;
  location: string;
  location_other?: string;
  verification_doc_url: string;
  admin_note?: string;
  send_invite?: boolean; // if true, send a magic link; otherwise generate temp password
};

/**
 * Admin-only: create a verified driver account directly.
 * Skips email confirmation, sets status='approved'.
 */
export async function adminCreateDriver(
  input: AdminCreateDriverInput,
): Promise<ActionResult<{ user_id: string; temp_password?: string }>> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };

  const sb = adminClient();

  // Generate secure random temporary password (admin can share with driver)
  const tempPassword = `RP-${crypto.randomUUID().slice(0, 8)}-${crypto.randomUUID().slice(0, 4)}`;

  // 1) Create auth user (email_confirm=true so they can log in immediately)
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
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
  });
  if (createErr || !created.user) {
    return { ok: false, error: createErr?.message ?? "Failed to create user" };
  }

  // 2) handle_new_driver trigger should have created the drivers row.
  //    Force status=approved + admin_note.
  const { error: updErr } = await sb
    .from("drivers")
    .update({
      status: "approved",
      admin_note: input.admin_note ?? null,
    })
    .eq("id", created.user.id);
  if (updErr) {
    return { ok: false, error: `User created but driver upgrade failed: ${updErr.message}` };
  }

  // 3) Optionally send a magic-link / password-reset email
  if (input.send_invite) {
    await sb.auth.admin.generateLink({
      type: "magiclink",
      email: input.email,
    });
  }

  return {
    ok: true,
    data: {
      user_id: created.user.id,
      temp_password: tempPassword,
    },
  };
}

/**
 * Admin: edit any driver's mutable fields. Phone / type / location / notes are
 * updated directly. Email goes through Supabase Auth's admin API so the auth
 * user matches the drivers row (a trigger keeps drivers.email in sync).
 */
export type AdminUpdateDriverInput = {
  driver_id: string;
  first_name?: string;
  surname?: string;
  phone?: string;
  email?: string;
  driver_type?: string;
  driver_type_other?: string | null;
  location?: string;
  location_other?: string | null;
  admin_note?: string | null;
};

export async function adminUpdateDriver(
  input: AdminUpdateDriverInput,
): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();

  // Update auth.users.email first (drivers.email syncs via trigger)
  if (input.email) {
    const { error: emailErr } = await sb.auth.admin.updateUserById(input.driver_id, {
      email: input.email,
      email_confirm: true,
    });
    if (emailErr) return { ok: false, error: `Email update: ${emailErr.message}` };
  }

  const patch: Database["public"]["Tables"]["drivers"]["Update"] = {};
  if (input.first_name !== undefined) patch.first_name = input.first_name;
  if (input.surname !== undefined) patch.surname = input.surname;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.driver_type !== undefined) patch.driver_type = input.driver_type;
  if (input.driver_type_other !== undefined)
    patch.driver_type_other = input.driver_type_other || null;
  if (input.location !== undefined) patch.location = input.location;
  if (input.location_other !== undefined)
    patch.location_other = input.location_other || null;
  if (input.admin_note !== undefined) patch.admin_note = input.admin_note;

  if (Object.keys(patch).length > 0) {
    const { error } = await sb.from("drivers").update(patch).eq("id", input.driver_id);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Admin: replace a driver's verification document.
 * Saves the new file path on drivers.verification_doc_url. The old object
 * stays in storage (admin can remove it manually if needed).
 */
export async function adminReplaceVerificationDoc(input: {
  driver_id: string;
  new_path: string;
}): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();
  const { error } = await sb
    .from("drivers")
    .update({ verification_doc_url: input.new_path })
    .eq("id", input.driver_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Admin: same as above but for waitlist entries (driver_signups).
 */
export type AdminUpdateWaitlistInput = {
  signup_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  driver_type?: string;
  driver_type_other?: string | null;
  location?: string;
  location_other?: string | null;
  admin_note?: string | null;
};

export async function adminUpdateWaitlist(
  input: AdminUpdateWaitlistInput,
): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();
  const patch: Database["public"]["Tables"]["driver_signups"]["Update"] = {};
  if (input.full_name !== undefined) patch.full_name = input.full_name;
  if (input.email !== undefined) patch.email = input.email;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.driver_type !== undefined) patch.driver_type = input.driver_type;
  if (input.driver_type_other !== undefined)
    patch.driver_type_other = input.driver_type_other || null;
  if (input.location !== undefined) patch.location = input.location;
  if (input.location_other !== undefined)
    patch.location_other = input.location_other || null;
  if (input.admin_note !== undefined) patch.admin_note = input.admin_note;

  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await sb
    .from("driver_signups")
    .update(patch)
    .eq("id", input.signup_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function adminReplaceWaitlistDoc(input: {
  signup_id: string;
  new_path: string;
}): Promise<ActionResult> {
  if (!(await hasRole("admin"))) return { ok: false, error: "Not authorized" };
  const sb = adminClient();
  const { error } = await sb
    .from("driver_signups")
    .update({ verification_file_url: input.new_path })
    .eq("id", input.signup_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
