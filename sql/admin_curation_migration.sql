-- ==============================================================
-- Classic Cosmetics: Admin Curation & Homepage Migration
-- Safe to execute in Supabase SQL Editor
-- ==============================================================

-- 1. Add is_best_seller & is_korean columns to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_korean BOOLEAN DEFAULT false;

-- 2. Add show_in_homepage column to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS show_in_homepage BOOLEAN DEFAULT false;

-- 3. Helpful partial indexes for ultra-fast homepage queries
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller
  ON public.products (is_best_seller)
  WHERE is_best_seller = true;

CREATE INDEX IF NOT EXISTS idx_products_is_korean
  ON public.products (is_korean)
  WHERE is_korean = true;

CREATE INDEX IF NOT EXISTS idx_categories_homepage
  ON public.categories (show_in_homepage, is_active, sort_order)
  WHERE show_in_homepage = true;
