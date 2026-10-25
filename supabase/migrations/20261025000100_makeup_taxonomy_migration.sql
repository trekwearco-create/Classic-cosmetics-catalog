-- Migration: Move Liquid Bases, Lipstick & Nail Polish under Makeup
-- Action: Database Category Parent Linkage

DO $$
DECLARE
  makeup_id UUID;
BEGIN
  -- Find the 'Makeup' category ID (or fallback to 'Makeup & Nails' if exists)
  SELECT id INTO makeup_id 
  FROM public.categories 
  WHERE LOWER(name) = 'makeup' 
  LIMIT 1;

  IF makeup_id IS NULL THEN
    SELECT id INTO makeup_id 
    FROM public.categories 
    WHERE LOWER(name) = 'makeup & nails' 
    LIMIT 1;
  END IF;

  IF makeup_id IS NOT NULL THEN
    -- Link Liquid Bases, Lipstick, Nail Polish as sub-categories under Makeup
    UPDATE public.categories 
    SET parent_id = makeup_id 
    WHERE LOWER(name) IN ('liquid bases', 'lipstick', 'nail polish', 'lipsticks', 'nail polishes');
  END IF;
END $$;
