-- Migration: Add is_best_seller and is_korean curation flags to products
-- Safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_korean BOOLEAN DEFAULT false;

-- Optional: create indexes for fast homepage queries
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller
  ON public.products (is_best_seller)
  WHERE is_best_seller = true;

CREATE INDEX IF NOT EXISTS idx_products_is_korean
  ON public.products (is_korean)
  WHERE is_korean = true;
