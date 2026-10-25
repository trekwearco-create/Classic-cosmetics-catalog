-- Classic Cosmetics: Brands management & Product brand relationship
-- 1. Create brands table if not exists
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add brand_id to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand_id);

-- 3. Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'brands_public_read'
  ) THEN
    CREATE POLICY "brands_public_read" ON public.brands FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'brands' AND policyname = 'brands_admin_manage'
  ) THEN
    CREATE POLICY "brands_admin_manage" ON public.brands FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
  END IF;
END $$;

GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL ON public.brands TO authenticated, service_role;

-- 4. Clean existing dummy/test brands data as requested in Task 4
DELETE FROM public.brands;
UPDATE public.products SET brand_id = NULL;
