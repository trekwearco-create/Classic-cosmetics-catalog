-- Classic Cosmetics: storage bucket and the first admin.
-- Run after 003_search_function.sql.

-- Storage policies. The public bucket itself is created in the Supabase
-- dashboard (Storage, new public bucket, name: product-images) or by the
-- matching insert below if the CLI is used.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "photos admin insert" on storage.objects;
create policy "photos admin insert" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "photos admin update" on storage.objects;
create policy "photos admin update" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "photos admin delete" on storage.objects;
create policy "photos admin delete" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- Allow public reads of the bucket (Standard Storage.read policy for a public bucket).
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select
  using (bucket_id = 'product-images');

insert into public.admin_users (user_id)
select id from auth.users where email = 'classiccosmetics@gmail.com'
on conflict (user_id) do nothing;
