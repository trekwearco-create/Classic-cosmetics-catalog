uct_images_product_idx on public.product_images (product_id, sort_order);
create unique index if not exists one_cover_per_product
  on public.product_images (product_id) where is_cover;
-- Classic Cosmetics: tables, indexes, triggers.
-- Run this file in the Supabase SQL editor first.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) check (price is null or price >= 0),
  discount_price numeric(10,2) check (discount_price is null or (discount_price >= 0 and discount_price < price)),
  is_visible boolean not null default true,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_visible_created_idx on public.products (is_visible, created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists prod
create table if not exists public.product_shades (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text,
  name text not null,
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  image_id uuid references public.product_images(id) on delete set null,
  is_available boolean not null default true,
  sort_order int not null default 0
);
create index if not exists product_shades_product_idx on public.product_shades (product_id, sort_order);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- Starting categories (confirmed by the owner).
insert into public.categories (name, slug, sort_order) values
  ('Lipstick', 'lipstick', 1),
  ('Nail polish', 'nail-polish', 2),
  ('Face', 'face', 3),
  ('Eyes', 'eyes', 4)
on conflict (name) do nothing;
