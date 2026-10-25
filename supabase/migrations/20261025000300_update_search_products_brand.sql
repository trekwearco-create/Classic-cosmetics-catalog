-- Update search_products function to also match on brand name and slug
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
  join public.categories c on c.id = p.category_id
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
