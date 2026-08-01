-- Lock down has_role so it can only be invoked by RLS-evaluating roles.
-- It must remain callable by `authenticated` because RLS policies on
-- user_roles, driver_signups, and storage.objects reference it.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
