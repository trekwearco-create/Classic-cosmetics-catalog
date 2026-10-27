-- Migration: Add category_ids array column to products table and update search_products RPC
-- Run this in Supabase SQL Editor if applying migrations manually

-- 1. Add category_ids uuid[] column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_ids uuid[] DEFAULT '{}';

-- 2. Index for fast array containment queries
CREATE INDEX IF NOT EXISTS products_category_ids_idx ON public.products USING gin (category_ids);

-- 3. Backfill category_ids with existing category_id for legacy products
UPDATE public.products
SET category_ids = ARRAY[category_id]
WHERE category_id IS NOT NULL AND (category_ids IS NULL OR category_ids = '{}');

-- 4. Update search_products function to support multi-category search
create or replace function public.search_products(
  q text default null,
  cat_slug text default null,
  lim int default 24,
  off int default 0
) returns setof public.products
language sql stable
set search_path = public
as $$
  select p.*
  from public.products p
  left join public.categories c on c.id = p.category_id
  where p.is_visible
    and (
      cat_slug is null or cat_slug = ''
      or c.slug = cat_slug
      or exists (
        select 1 from public.categories c2
        where c2.slug = cat_slug
          and (c2.id = any(coalesce(p.category_ids, '{}')) or c2.id = p.category_id)
      )
    )
    and (
      q is null or q = ''
      or p.name ilike '%' || q || '%'
      or c.name ilike '%' || q || '%'
      or exists (
        select 1 from public.brands b
        where b.id = p.brand_id
          and (b.name ilike '%' || q || '%' or b.slug ilike '%' || q || '%')
      )
      or exists (
        select 1 from public.product_shades s
        where s.product_id = p.id
          and (s.name ilike '%' || q || '%' or s.code ilike '%' || q || '%')
      )
    )
  order by p.created_at desc
  limit least(greatest(coalesce(lim, 24), 1), 48)
  offset least(greatest(coalesce(off, 0), 0), 5000);
$$;

grant execute on function public.search_products(text, text, int, int) to anon, authenticated;
