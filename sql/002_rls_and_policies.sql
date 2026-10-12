-- Classic Cosmetics: is_admin, row level security, privileges.
-- Run after 001_tables.sql.

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_shades  enable row level security;
alter table public.admin_users     enable row level security;

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (true);

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (is_visible or public.is_admin());

drop policy if exists "images public read" on public.product_images;
create policy "images public read" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_visible or public.is_admin())
    )
  );

drop policy if exists "shades public read" on public.product_shades;
create policy "shades public read" on public.product_shades
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_visible or public.is_admin())
    )
  );

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "images admin write" on public.product_images;
create policy "images admin write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "shades admin write" on public.product_shades;
create policy "shades admin write" on public.product_shades
  for all using (public.is_admin()) with check (public.is_admin());

-- rate_limit_hits is written only by service-side code paths via the anon
-- client using the user-id subject; keep it readable by nobody but writable
-- by the anon role only for the login rate limiter's own rows.
revoke all on public.admin_users from anon, authenticated;
revoke insert, update, delete on public.categories, public.products,
                               public.product_images, public.product_shades from anon;
grant select on public.categories, public.products,
                 public.product_images, public.product_shades to authenticated;
grant insert, update, delete on public.categories, public.products,
                                public.product_images, public.product_shades
  to authenticated;
