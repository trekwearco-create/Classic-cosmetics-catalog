-- Migration 007: Add show_in_homepage to categories table for Admin-Editable "Shop by Category"
-- Safe additive migration. Run in Supabase SQL Editor if not already applied.

BEGIN;

ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS show_in_homepage BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS categories_homepage_idx ON public.categories (show_in_homepage, is_active, sort_order);

COMMIT;
