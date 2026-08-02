-- Digital member card. A driver shows this in-store to claim an offer, so it
-- needs two things the drivers table doesn't have yet: a photo, and a stable
-- human-readable membership number.
--
-- Safe to re-run.

-- ---------------------------------------------------------------- member number
-- A sequence rather than a hash of the uuid: the number is read aloud and typed
-- by merchants, so it has to be short, stable and never collide.
create sequence if not exists public.drivers_member_number_seq start with 10000;

alter table public.drivers
  add column if not exists member_number bigint;

-- Backfill oldest-first so early members get the low numbers.
do $$
declare r record;
begin
  for r in
    select id from public.drivers where member_number is null order by created_at
  loop
    update public.drivers
       set member_number = nextval('public.drivers_member_number_seq')
     where id = r.id;
  end loop;
end $$;

alter table public.drivers
  alter column member_number set default nextval('public.drivers_member_number_seq');

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'drivers_member_number_key'
  ) then
    alter table public.drivers add constraint drivers_member_number_key unique (member_number);
  end if;
end $$;

-- ---------------------------------------------------------------- photo
alter table public.drivers
  add column if not exists photo_url text;

-- The lockdown migration revoked blanket UPDATE from authenticated and granted
-- named columns only, so the new column needs an explicit grant or drivers
-- cannot set their own card photo.
grant update (photo_url) on public.drivers to authenticated;

-- ---------------------------------------------------------------- storage
-- Private. The card renders a short-lived signed URL server-side, so a member's
-- face is never on a guessable public URL.
insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', false)
on conflict (id) do nothing;

-- Objects live at <user-id>/<filename>, and each driver is confined to their
-- own folder. Note this is authenticated-only — unlike the verification bucket,
-- there is no anonymous write path here.
drop policy if exists "Members manage own photo" on storage.objects;
create policy "Members manage own photo" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'member-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'member-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins manage member photos" on storage.objects;
create policy "Admins manage member photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'member-photos' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'member-photos' and public.has_role(auth.uid(), 'admin'));
