-- Phase 1 — Real driver accounts
-- Run in Supabase SQL Editor (or via supabase CLI if linked)

-- 1) Extend app_role enum with 'driver' and 'business' values
do $$
begin
  if not exists (select 1 from pg_enum where enumtypid = 'public.app_role'::regtype and enumlabel = 'driver') then
    alter type public.app_role add value 'driver';
  end if;
  if not exists (select 1 from pg_enum where enumtypid = 'public.app_role'::regtype and enumlabel = 'business') then
    alter type public.app_role add value 'business';
  end if;
end $$;

-- 2) drivers table — separate from waitlist driver_signups
create table if not exists public.drivers (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  surname text not null,
  email text not null unique,
  phone text not null,
  driver_type text not null,
  location text not null,
  verification_doc_url text not null,
  status public.signup_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists drivers_status_idx on public.drivers(status);
create index if not exists drivers_email_idx  on public.drivers(email);

alter table public.drivers enable row level security;

-- self read / self update
drop policy if exists "drivers self read"   on public.drivers;
drop policy if exists "drivers self update" on public.drivers;
drop policy if exists "drivers admin read"  on public.drivers;
drop policy if exists "drivers admin all"   on public.drivers;

create policy "drivers self read"
  on public.drivers for select
  to authenticated
  using (auth.uid() = id);

create policy "drivers self update"
  on public.drivers for update
  to authenticated
  using (auth.uid() = id);

create policy "drivers admin read"
  on public.drivers for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "drivers admin all"
  on public.drivers for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.touch_updated_at();

-- 3) Auto-create a drivers row + user_roles entry when a new driver signs up.
-- Driven by raw_user_meta_data.role = 'driver' set during signup.
create or replace function public.handle_new_driver()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.raw_user_meta_data->>'role' = 'driver' then
    insert into public.drivers (
      id, first_name, surname, email, phone, driver_type, location, verification_doc_url
    ) values (
      new.id,
      coalesce(new.raw_user_meta_data->>'first_name', ''),
      coalesce(new.raw_user_meta_data->>'surname', ''),
      new.email,
      coalesce(new.raw_user_meta_data->>'phone', ''),
      coalesce(new.raw_user_meta_data->>'driver_type', ''),
      coalesce(new.raw_user_meta_data->>'location', ''),
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

drop trigger if exists on_auth_user_created_driver on auth.users;
create trigger on_auth_user_created_driver
  after insert on auth.users
  for each row execute function public.handle_new_driver();

-- 4) Allow drivers to upload verification before they're authenticated (during signup flow)
-- The existing storage policy "Anyone can upload verification" already covers anon+authenticated insert.
-- Make signed-URL reads admin-only (already in place from earlier migration).
