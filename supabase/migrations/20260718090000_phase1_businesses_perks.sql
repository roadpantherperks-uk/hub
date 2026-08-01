-- Phase 1 — Businesses, partner applications, perks.
-- Safe to run whole. All objects use IF NOT EXISTS / OR REPLACE / guarded DO blocks
-- so re-running is a no-op.
--
-- Design decisions (see docs/roadmap.md):
--   * ONE businesses table. A business's relationship to the platform (perk
--     partner / service provider / sponsor) lives in business_relationships, so
--     one business can be several things at once.
--   * business_users links auth.users -> businesses (a member and a business
--     owner can be the same person; never assume one user = one role).
--   * Stripe/billing columns exist from day one so we never reshape the table
--     under a live admin UI. Payments are still manual for now (Phase 5).
--   * Base tables are admin/service-role only. Public pages read via the
--     service-role key server-side and return only safe columns, so there are
--     no anon SELECT policies to leak Stripe ids.

-- ---------------------------------------------------------------- enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_status') then
    create type public.business_status as enum ('pending', 'approved', 'rejected', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'billing_status') then
    create type public.billing_status as enum ('none', 'checkout_started', 'active', 'past_due', 'canceled');
  end if;
  if not exists (select 1 from pg_type where typname = 'relationship_type') then
    create type public.relationship_type as enum ('perk_partner', 'service_provider', 'sponsor');
  end if;
end $$;

-- ---------------------------------------------------------------- businesses
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_name text,
  contact_email text not null,
  contact_phone text,
  website text,
  description text,
  category text,
  location text,
  logo_url text,
  status public.business_status not null default 'pending',
  -- pricing tier: 'basic' (£9/mo, 1 offer) or 'advanced' (£24/mo, 3 offers). See src/lib/tiers.ts.
  plan text not null default 'basic',
  billing_status public.billing_status not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_status_idx on public.businesses(status);
create index if not exists businesses_billing_status_idx on public.businesses(billing_status);

-- ---------------------------------------------------------------- business_users
create table if not exists public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index if not exists business_users_user_idx on public.business_users(user_id);

-- ---------------------------------------------------------------- business_relationships
create table if not exists public.business_relationships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.relationship_type not null,
  created_at timestamptz not null default now(),
  unique (business_id, type)
);

-- ---------------------------------------------------------------- perk_categories
create table if not exists public.perk_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------- perks
create table if not exists public.perks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_id uuid references public.perk_categories(id) on delete set null,
  title text not null,
  summary text,
  description text,
  discount_label text,
  terms text,
  redemption_type text not null default 'code',   -- code | link | in_store
  code text,
  link text,
  location_label text,
  is_active boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists perks_business_idx on public.perks(business_id);
create index if not exists perks_active_idx on public.perks(is_active);

-- ---------------------------------------------------------------- updated_at triggers
-- public.touch_updated_at() already exists from the phase-1 drivers migration.
drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.touch_updated_at();

drop trigger if exists perks_set_updated_at on public.perks;
create trigger perks_set_updated_at
  before update on public.perks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- RLS
-- Base tables: admins read/write via the authenticated browser client;
-- everything else (public reads, application inserts, Stripe) goes through the
-- service-role key server-side, which bypasses RLS. So the only policies we need
-- are the admin ones. perk_categories is the one exception — harmless labels,
-- readable by anyone for filter UIs.

alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.business_relationships enable row level security;
alter table public.perk_categories enable row level security;
alter table public.perks enable row level security;

drop policy if exists "businesses admin all" on public.businesses;
create policy "businesses admin all" on public.businesses
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "business_users self read" on public.business_users;
create policy "business_users self read" on public.business_users
  for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "business_users admin all" on public.business_users;
create policy "business_users admin all" on public.business_users
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "business_relationships admin all" on public.business_relationships;
create policy "business_relationships admin all" on public.business_relationships
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "perks admin all" on public.perks;
create policy "perks admin all" on public.perks
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Categories: public read, admin write.
drop policy if exists "perk_categories public read" on public.perk_categories;
create policy "perk_categories public read" on public.perk_categories
  for select to anon, authenticated
  using (true);

drop policy if exists "perk_categories admin all" on public.perk_categories;
create policy "perk_categories admin all" on public.perk_categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- storage: business logos (public bucket)
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

drop policy if exists "Public read business logos" on storage.objects;
create policy "Public read business logos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'business-logos');

drop policy if exists "Admins manage business logos" on storage.objects;
create policy "Admins manage business logos" on storage.objects
  for all to authenticated
  using (bucket_id = 'business-logos' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'business-logos' and public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- seed categories
insert into public.perk_categories (name, slug, sort_order) values
  ('Fuel & EV Charging', 'fuel-ev', 10),
  ('Tyres & Maintenance', 'tyres-maintenance', 20),
  ('Insurance', 'insurance', 30),
  ('Food & Drink', 'food-drink', 40),
  ('Vehicle Accessories', 'accessories', 50),
  ('Business Services', 'business-services', 60),
  ('Other', 'other', 99)
on conflict (slug) do nothing;
