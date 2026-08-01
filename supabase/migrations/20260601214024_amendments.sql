-- Amendments per client feedback (May 2026):
-- 1. Driver Type now includes "Other" with a custom text value.
-- 2. Location now includes "Other" with a custom text value.
-- 3. Admin can edit driver details (handled by existing RLS admin policies).
-- 4. Auth-side email change should sync to the drivers row.

-- 1) Add Other-text columns to both real drivers and the waitlist
alter table public.drivers
  add column if not exists driver_type_other text,
  add column if not exists location_other text;

alter table public.driver_signups
  add column if not exists driver_type_other text,
  add column if not exists location_other text;

-- 2) Extend handle_new_driver to pull the Other-text fields out of metadata
create or replace function public.handle_new_driver()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.raw_user_meta_data->>'role' = 'driver' then
    insert into public.drivers (
      id, first_name, surname, email, phone,
      driver_type, driver_type_other,
      location, location_other,
      verification_doc_url
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'first_name', ''),
      coalesce(new.raw_user_meta_data->>'surname', ''),
      new.email,
      coalesce(new.raw_user_meta_data->>'phone', ''),
      coalesce(new.raw_user_meta_data->>'driver_type', ''),
      nullif(new.raw_user_meta_data->>'driver_type_other', ''),
      coalesce(new.raw_user_meta_data->>'location', ''),
      nullif(new.raw_user_meta_data->>'location_other', ''),
      coalesce(new.raw_user_meta_data->>'verification_doc_url', '')
    )
    on conflict (id) do nothing;

    insert into public.user_roles (user_id, role)
    values (new.id, 'driver')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

-- 3) Keep drivers.email in sync when auth.users.email changes (driver self-update
--    OR admin update via service-role)
create or replace function public.sync_driver_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.email is distinct from new.email then
    update public.drivers
       set email = new.email,
           updated_at = now()
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_change on auth.users;
create trigger on_auth_user_email_change
  after update of email on auth.users
  for each row execute function public.sync_driver_email();
