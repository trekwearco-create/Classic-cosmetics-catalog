-- Allow category_id to be nullable for products
ALTER TABLE public.products ALTER COLUMN category_id DROP NOT NULL;

-- Ensure curation flags exist on products with default false
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_korean boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_in_homepage boolean DEFAULT false;

-- Update search_products function with LEFT JOIN so products without category can still be found
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
    and (cat_slug is null or cat_slug = '' or c.slug = cat_slug)
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
