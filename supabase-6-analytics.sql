-- =====================================================================
-- EVERYTHING ZANZIBAR - Visitor analytics (first-party, privacy-light)
-- Logs page views with COARSE geo (country / region / city) derived from
-- Vercel edge headers. No IP address or personal data is ever stored.
-- Reads are admin-only. Run this once in Supabase -> SQL Editor.
-- =====================================================================

create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  path        text,
  country     text,          -- ISO-3166 alpha-2 (e.g. TZ, US, GB)
  region      text,
  city        text,
  referrer    text,
  visitor_id  text           -- random id from the browser (not PII)
);

create index if not exists page_views_created_idx  on public.page_views (created_at desc);
create index if not exists page_views_country_idx  on public.page_views (country);
create index if not exists page_views_visitor_idx  on public.page_views (visitor_id);

alter table public.page_views enable row level security;

-- Anyone may LOG a view; only an admin may READ the raw rows.
drop policy if exists "public log view" on public.page_views;
create policy "public log view" on public.page_views
  for insert to anon, authenticated with check (true);

drop policy if exists "admin read views" on public.page_views;
create policy "admin read views" on public.page_views
  for select using (public.ez_role() = 'admin');

-- Aggregated dashboard payload - admin only. SECURITY DEFINER so it can
-- read the table, but it refuses anyone whose role is not admin.
create or replace function public.analytics_overview(days int default 30)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare result json;
begin
  -- coalesce is REQUIRED: for a non-admin/anon caller ez_role() is NULL, and
  -- NULL <> 'admin' is NULL (not true), which would skip the guard and leak data.
  if coalesce(public.ez_role(), '') <> 'admin' then
    raise exception 'admin only';
  end if;

  with scope as (
    select * from public.page_views
    where created_at >= now() - make_interval(days => days)
  )
  select json_build_object(
    'days',           days,
    'totalViews',     (select count(*) from scope),
    'uniqueVisitors', (select count(distinct visitor_id) from scope),
    'countries',      (select count(distinct country) from scope where country is not null),
    'byCountry', (select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(country, '??') as country,
               count(*)::int as views,
               count(distinct visitor_id)::int as visitors
        from scope group by 1 order by views desc limit 25) t),
    'byCity', (select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(nullif(city, ''), 'Unknown') as city,
               coalesce(country, '??') as country,
               count(*)::int as views
        from scope group by 1, 2 order by views desc limit 25) t),
    'byDay', (select coalesce(json_agg(t), '[]'::json) from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               count(*)::int as views
        from scope group by 1 order by 1) t),
    'byPath', (select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(nullif(path, ''), '/') as path,
               count(*)::int as views
        from scope group by 1 order by views desc limit 10) t),
    'recent', (select coalesce(json_agg(t), '[]'::json) from (
        select to_char(created_at, 'YYYY-MM-DD HH24:MI') as at,
               coalesce(nullif(city, ''), '') as city,
               coalesce(country, '') as country,
               coalesce(nullif(path, ''), '/') as path
        from scope order by created_at desc limit 20) t)
  ) into result;

  return result;
end;
$$;

-- Supabase grants execute to anon by default privileges, so revoke it
-- explicitly (belt-and-braces alongside the in-function admin guard above).
revoke all on function public.analytics_overview(int) from public, anon;
grant execute on function public.analytics_overview(int) to authenticated;
