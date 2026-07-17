-- ============================================================================
-- Everything Zanzibar — STEP 1 of the Fleet + Marketplace build
--   1) public.vehicles          -> "Self-Driven Freedom" rental rides
--   2) public.events (extended) -> Tanzania Event Marketplace fields
--   3) RLS + seed data
-- Run in Supabase → SQL Editor. Idempotent (safe to re-run).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) VEHICLES — Self-Driven Freedom / pickup transport
-- ---------------------------------------------------------------------------
create table if not exists public.vehicles (
  id          text primary key,                 -- 'v1' | 'v<timestamp>' (client-managed, like yachts)
  name        text not null,                    -- "Zanzibar Scooter", "Rugged Quad Bike"
  category    text,                             -- scooter | quad | bicycle | suv | jeep | tuktuk
  daily_rate  numeric,                          -- 25  (USD / day)
  engine      text,                             -- "125cc automatic"
  seats       text,                             -- "2 riders"
  fuel        text,                             -- "Petrol - very light on fuel"
  description text,
  image_url   text,                             -- -> everything-zanzibar-media/rentals/
  is_active   boolean default true,
  sort        int default 0,
  created_at  timestamptz default now()
);

alter table public.vehicles enable row level security;

drop policy if exists "public read vehicles" on public.vehicles;
create policy "public read vehicles" on public.vehicles
  for select using (is_active = true);

drop policy if exists "mgr write vehicles" on public.vehicles;
create policy "mgr write vehicles" on public.vehicles
  for all using      (public.ez_role() in ('admin','manager'))
      with check (public.ez_role() in ('admin','manager'));

-- ---------------------------------------------------------------------------
-- 2) EVENTS — extend for the Tanzania Event Marketplace
-- ---------------------------------------------------------------------------
alter table public.events
  add column if not exists organizer    text,
  add column if not exists region       text    default 'zanzibar',
  add column if not exists venue        text,
  add column if not exists timezone     text    default 'Africa/Dar_es_Salaam',
  add column if not exists ticket_tiers jsonb   default '[]'::jsonb,  -- [{"name":"VIP","price":100},{"name":"Regular","price":30}]
  add column if not exists sponsored    boolean default false,        -- premium / marquee placement
  add column if not exists is_active    boolean default true;

-- constrain region to the two marketplaces
do $$ begin
  alter table public.events add constraint events_region_chk check (region in ('zanzibar','mainland'));
exception when duplicate_object then null; end $$;

-- IMPORTANT: events were previously staff-only. The marketplace is public-facing,
-- so live events must be readable by anonymous visitors. Writes stay staff-only.
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select using (is_active = true);

-- ---------------------------------------------------------------------------
-- 3) SEED — Self-Driven Freedom fleet (upsert by id, safe to re-run)
-- ---------------------------------------------------------------------------
insert into public.vehicles (id, name, category, daily_rate, engine, seats, fuel, description, sort) values
('v1','Zanzibar Scooter',       'scooter', 25, '125cc automatic',      '2 riders',  'Petrol - very light',  'The classic island way to weave the coast roads. Helmets included.',            1),
('v2','Rugged Quad Bike',       'quad',    60, '250cc 4-stroke',       '1-2 riders','Petrol',               'Off-road ready for dirt tracks, villages and palm groves.',                     2),
('v3','Beach Bicycle',          'bicycle', 10, 'Pedal power',          '1 rider',   'None - just you',      'Cruise the village lanes and beach paths at your own pace.',                    3),
('v4','Cruiser SUV',            'suv',     90, '2.5L automatic',       '6 seats',   'Diesel - A/C',         'Premium comfort for families and longer island cruises.',                       4),
('v5','Compact Safari 4x4 Jeep','jeep',    55, '4x4 manual',           '4 seats',   'Petrol - A/C',         'Go-anywhere on dirt tracks to the hidden beaches.',                             5)
on conflict (id) do update set
  name=excluded.name, category=excluded.category, daily_rate=excluded.daily_rate,
  engine=excluded.engine, seats=excluded.seats, fuel=excluded.fuel,
  description=excluded.description, sort=excluded.sort, is_active=true;

-- Backfill region/organizer on any existing events so the marketplace filters work
update public.events set region = 'zanzibar' where region is null;
update public.events set is_active = true    where is_active is null;

-- ---------------------------------------------------------------------------
-- confirm
-- ---------------------------------------------------------------------------
select
  (select count(*) from public.vehicles) as vehicles,
  (select count(*) from public.events)   as events;
