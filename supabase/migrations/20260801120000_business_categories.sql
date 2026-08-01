-- Client feedback (Aug 2026), two related changes:
--
-- 1. "Other" on the partner application had no free-text field, so the answer
--    was lost. Adds businesses.category_other, mirroring the driver_type_other /
--    location_other pattern already used on drivers.
--
-- 2. Replaces the category vocabulary with the client's list. Note there are
--    two lists in play: businesses.category (free text, driven by
--    BUSINESS_CATEGORIES in src/lib/options.ts) and this perk_categories table
--    (categorises individual offers). They are kept identical so a business and
--    its offer never file under different names.
--
-- Safe to re-run.

-- ---------------------------------------------------------------- 1. category_other
alter table public.businesses
  add column if not exists category_other text;

-- ---------------------------------------------------------------- 2. perk_categories
-- Rename in place where a natural successor exists, so any perk already
-- pointing at the row keeps its category instead of being reset to null.
update public.perk_categories
   set name = 'Tyres', slug = 'tyres', sort_order = 30
 where slug = 'tyres-maintenance'
   and not exists (select 1 from public.perk_categories where slug = 'tyres');

insert into public.perk_categories (name, slug, sort_order) values
  ('MOT & Services',            'mot-services',       10),
  ('Car Repair',                'car-repair',         20),
  ('Tyres',                     'tyres',              30),
  ('Car Wash',                  'car-wash',           40),
  ('Car Sales Garages',         'car-sales-garages',  50),
  ('Barbers',                   'barbers',            60),
  ('Beauty, Nail & Hair Salons','salons',             70),
  ('Gyms',                      'gyms',               80),
  ('Food & Drink',              'food-drink',         90),
  ('Mobile Phone Shops',        'mobile-phone-shops', 100),
  ('Other',                     'other',              110)
on conflict (slug) do update
  set name = excluded.name,
      sort_order = excluded.sort_order;

-- Retire the categories that are no longer offered, but only where nothing
-- references them — never silently detach an existing offer from its category.
delete from public.perk_categories c
 where c.slug in ('fuel-ev', 'tyres-maintenance', 'insurance', 'accessories', 'business-services')
   and not exists (select 1 from public.perks p where p.category_id = c.id);
