-- ============================================================================
-- Everything Zanzibar — MEDIA BUCKET  'everything-zanzibar-media'
-- Run in Supabase → SQL Editor. Safe to re-run (idempotent).
--
-- Folder layout used by EZ.media.FOLDERS in public/backend/ez-api.js:
--   banners/     homepage, founders, booking hero banners
--   activities/  snorkelling, caves, parasailing, ...
--   yachts/      fleet images, cabin layouts, deck views
--   hotels/      partner hotels & villas, room cards
--   rentals/     cars, scooters, jet skis (logistics cards)
--   journal/     editorial images
--   events/      promotional flyers
--   brand/       logos & misc     library/  free-form uploads
--
-- Security: PUBLIC read (so the website can show images) +
--           WRITE restricted to signed-in staff (admin | manager | media).
-- ============================================================================

-- 1) The bucket (public read, 10 MB cap, images + short video)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'everything-zanzibar-media',
  'everything-zanzibar-media',
  true,
  10485760,
  array['image/webp','image/jpeg','image/png','image/avif','image/svg+xml','image/gif','video/mp4','video/webm']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2) PUBLIC READ — anyone can view the images on the live site
drop policy if exists "ezm public read" on storage.objects;
create policy "ezm public read" on storage.objects
  for select using (bucket_id = 'everything-zanzibar-media');

-- 3) STAFF WRITE — only signed-in admin/manager/media may upload
drop policy if exists "ezm staff insert" on storage.objects;
create policy "ezm staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'everything-zanzibar-media' and public.ez_role() in ('admin','manager','media'));

drop policy if exists "ezm staff update" on storage.objects;
create policy "ezm staff update" on storage.objects
  for update to authenticated
  using       (bucket_id = 'everything-zanzibar-media' and public.ez_role() in ('admin','manager','media'))
  with check  (bucket_id = 'everything-zanzibar-media' and public.ez_role() in ('admin','manager','media'));

drop policy if exists "ezm staff delete" on storage.objects;
create policy "ezm staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'everything-zanzibar-media' and public.ez_role() in ('admin','manager','media'));

-- 4) Confirm
select id, public, file_size_limit from storage.buckets where id = 'everything-zanzibar-media';
