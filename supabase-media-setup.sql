-- ============================================================================
-- Everything Zanzibar — MEDIA STORAGE setup (fixes image/video uploads)
-- Run in Supabase → SQL Editor. Do it AFTER creating a PUBLIC bucket named
-- 'media' (Storage → New bucket → name: media → toggle Public → Create).
-- Uploads only work while you are SIGNED IN to /admin as admin/manager/media.
-- ============================================================================

-- Belt-and-braces: create the bucket if the dashboard didn't.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Anyone can VIEW media (it's a public bucket / public image URLs).
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');

-- Only signed-in staff may UPLOAD / REPLACE / DELETE media.
drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.ez_role() in ('admin','manager','media'));

drop policy if exists "staff update media" on storage.objects;
create policy "staff update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.ez_role() in ('admin','manager','media'));

drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.ez_role() in ('admin','manager','media'));

-- Confirm:
select id, public from storage.buckets where id = 'media';
