-- ============================================================================
-- EVERYTHING ZANZIBAR — Postgres schema + Supabase Row-Level-Security (RBAC)
-- Run this in the Supabase SQL editor (or any Postgres for the Express path —
-- skip the "auth." / RLS blocks if you are NOT on Supabase; see backend/README.md).
-- ============================================================================

-- ---------- ROLES / PROFILES (RBAC) ----------
-- Each staff member is an auth user with a role in profiles. 3 tiers:
--   'admin'   – full access
--   'manager' – activities, hotels, transit, events
--   'media'   – media + journal only
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  role        text not null default 'media' check (role in ('admin','manager','media')),
  created_at  timestamptz default now()
);

-- helper: the caller's role (used by every policy below)
-- SECURITY DEFINER so it bypasses RLS when reading profiles — otherwise a policy
-- that calls ez_role() while reading profiles recurses ("stack depth limit exceeded").
create or replace function public.ez_role() returns text
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role) values (new.id, new.email, 'media')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- DATA TABLES ----------
create table if not exists public.activities (
  name           text primary key,
  category       text,
  location       text,
  duration       text,
  visual_prompt  text,
  image_url      text,
  price_single   numeric,
  price_double   numeric,
  price_triple   numeric,
  price_group    numeric,
  is_active      boolean default true,
  updated_at     timestamptz default now()
);

create table if not exists public.hotels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  area        text,
  image_url   text,
  highlights  text[] default '{}',
  sort        int default 0
);

-- The Fleet Experience (yachts & cruisers shown on the booking storefront)
create table if not exists public.yachts (
  id          text primary key,                    -- client-managed id (y1, y<timestamp>)
  name        text not null,
  capacity    text,                                -- operational capacity tag, e.g. 'Up to 12 guests'
  price_label text,                                -- 'from $850 / day'
  image_url   text,                                -- public storage bucket URL
  description text,
  amenities   text[] default '{}',
  sort        int default 0
);

create table if not exists public.transit (
  id          int primary key default 1,           -- singleton row
  intro       text,
  throughout  text,
  departure   text
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  starts_at   timestamptz,
  price_tiers text,
  flyer_url   text,
  description text,
  created_at  timestamptz default now()
);

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text,
  published   date,
  image_url   text,
  excerpt     text,
  body        text,
  created_at  timestamptz default now()
);

-- Visitor Booking & Payments Vault
create table if not exists public.bookings (
  id          text primary key,                    -- EZ-XXXXXX reservation id
  name        text,
  contact     text,
  travel_date date,
  assets      text,
  total       numeric,
  type        text,
  status      text not null default 'Pending WhatsApp Escrow Verification'
              check (status in ('Pending WhatsApp Escrow Verification','Paid & Locked','Cancelled')),
  created_at  timestamptz default now()
);

-- Private ACTIVITY reservations (Name, Phone, Activity, Date, Pax, Price) — ADMIN-only read
create table if not exists public.reservations (
  id          text primary key,                    -- EZ-XXXXXX
  name        text,
  phone       text,
  activity    text,
  travel_date date,
  pax         int,
  total       numeric,
  status      text not null default 'Pending WhatsApp Escrow Verification'
              check (status in ('Pending WhatsApp Escrow Verification','Paid & Locked','Cancelled')),
  created_at  timestamptz default now()
);

create table if not exists public.settings (
  key   text primary key,
  value jsonb
);

-- ============================================================================
-- ROW-LEVEL SECURITY (Supabase). Public pages use the anon key; staff sign in.
-- ============================================================================
alter table public.profiles   enable row level security;
alter table public.activities enable row level security;
alter table public.hotels     enable row level security;
alter table public.transit    enable row level security;
alter table public.events     enable row level security;
alter table public.posts      enable row level security;
alter table public.bookings   enable row level security;
alter table public.yachts       enable row level security;
alter table public.reservations enable row level security;
alter table public.settings   enable row level security;

-- profiles: a user can read their own profile; admins read/write all
create policy "own profile read"  on public.profiles for select using (id = auth.uid());
create policy "admin profiles rw" on public.profiles for all using (public.ez_role() = 'admin') with check (public.ez_role() = 'admin');

-- PUBLIC site reads catalogue content (anon):
create policy "public read activities" on public.activities for select using (true);
create policy "public read hotels"     on public.hotels     for select using (true);
create policy "public read yachts"     on public.yachts     for select using (true);
create policy "public read transit"    on public.transit    for select using (true);
create policy "public read posts"      on public.posts      for select using (true);
create policy "public read settings"   on public.settings   for select using (true);

-- Manager + Admin manage catalogue / hotels / transit / events:
create policy "mgr write activities" on public.activities for all using (public.ez_role() in ('admin','manager')) with check (public.ez_role() in ('admin','manager'));
create policy "mgr write hotels"     on public.hotels     for all using (public.ez_role() in ('admin','manager')) with check (public.ez_role() in ('admin','manager'));
create policy "mgr write yachts"     on public.yachts     for all using (public.ez_role() in ('admin','manager')) with check (public.ez_role() in ('admin','manager'));
create policy "mgr write transit"    on public.transit    for all using (public.ez_role() in ('admin','manager')) with check (public.ez_role() in ('admin','manager'));
create policy "mgr rw events"        on public.events     for all using (public.ez_role() in ('admin','manager')) with check (public.ez_role() in ('admin','manager'));

-- Media + Admin manage journal posts:
create policy "media write posts"    on public.posts      for all using (public.ez_role() in ('admin','media')) with check (public.ez_role() in ('admin','media'));

-- BOOKINGS: anyone (anon) may INSERT (the public forms shadow-log), only ADMIN may read/update/delete:
create policy "anon log booking"     on public.bookings   for insert with check (true);
create policy "admin read bookings"  on public.bookings   for select using (public.ez_role() = 'admin');
create policy "admin write bookings" on public.bookings   for update using (public.ez_role() = 'admin');
create policy "admin del bookings"   on public.bookings   for delete using (public.ez_role() = 'admin');

-- RESERVATIONS: anon may INSERT (the activity booking modal), only ADMIN may read/update/delete:
create policy "anon log reservation"     on public.reservations for insert with check (true);
create policy "admin read reservations"  on public.reservations for select using (public.ez_role() = 'admin');
create policy "admin write reservations" on public.reservations for update using (public.ez_role() = 'admin');
create policy "admin del reservations"   on public.reservations for delete using (public.ez_role() = 'admin');

-- Admin manages settings:
create policy "admin write settings" on public.settings   for all using (public.ez_role() = 'admin') with check (public.ez_role() = 'admin');

-- ---------- STORAGE ----------
-- In the Supabase dashboard create a PUBLIC bucket named 'media'.
-- Then allow staff to upload, everyone to read:
-- insert into storage.buckets (id, name, public) values ('media','media',true) on conflict do nothing;
create policy "public read media"  on storage.objects for select using ( bucket_id = 'media' );
create policy "staff upload media" on storage.objects for insert with check ( bucket_id = 'media' and public.ez_role() in ('admin','manager','media') );

-- ---------- bootstrap your first admin (run AFTER you create the auth user) ----------
-- update public.profiles set role = 'admin' where email = 'you@everythingzanzibar.com';
