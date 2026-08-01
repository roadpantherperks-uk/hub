-- The "drivers self update" policy restricts which ROW a driver may update, but
-- RLS cannot restrict which COLUMNS. With no WITH CHECK, Postgres reuses the
-- USING expression, which only pins `id` — leaving status, admin_note and
-- verification_doc_url writable by the driver from the browser client.
--
-- Column-level privileges are the missing half. A guard trigger is the obvious
-- alternative but would also fire on sync_driver_email()'s write, where there is
-- no JWT to inspect, and would block the email sync.
--
-- Admin writes are unaffected: they go through the service-role key in
-- admin-actions.ts, and SECURITY DEFINER functions run as the table owner.

revoke update on public.drivers from authenticated;

grant update (
  phone,
  driver_type,
  driver_type_other,
  location,
  location_other
) on public.drivers to authenticated;

-- driver_signups is anon-insertable with WITH CHECK (true), so status is
-- settable by an anonymous submitter. Only admins have any business writing it.
revoke insert on public.driver_signups from anon, authenticated;

grant insert (
  full_name,
  email,
  phone,
  driver_type,
  driver_type_other,
  location,
  location_other,
  verification_file_url
) on public.driver_signups to anon, authenticated;
