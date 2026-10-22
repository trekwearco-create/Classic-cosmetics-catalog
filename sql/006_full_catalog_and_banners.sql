-- Migration 006: Highfy Category Tree, Menu Links, Home Sections & Banners
-- ADDITIVE ONLY: Safe transaction, no DROP/TRUNCATE/DELETE of existing user data, no UPDATE of existing category rows.
-- Safe to run in Supabase SQL Editor.

BEGIN;

-- 1. Ensure categories columns exist
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS show_in_menu boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS categories_parent_idx ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_active_menu_idx ON public.categories (is_active, show_in_menu, sort_order);

-- Drop unique constraint on name if it exists so duplicate names across different parents are permitted (slug remains unique)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_name_key'
  ) THEN
    ALTER TABLE public.categories DROP CONSTRAINT categories_name_key;
  END IF;
END $$;

-- 2. Menu Links table (Non-category navigation links)
CREATE TABLE IF NOT EXISTS public.menu_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.menu_links(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS menu_links_parent_idx ON public.menu_links (parent_id, sort_order);

ALTER TABLE public.menu_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_links public read" ON public.menu_links;
CREATE POLICY "menu_links public read" ON public.menu_links
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "menu_links admin all" ON public.menu_links;
CREATE POLICY "menu_links admin all" ON public.menu_links
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Home Sections table
CREATE TABLE IF NOT EXISTS public.home_sections (
  key text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'banner',
  bg_color text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS home_sections_sort_idx ON public.home_sections (sort_order, is_visible);

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "home_sections public read" ON public.home_sections;
CREATE POLICY "home_sections public read" ON public.home_sections
  FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "home_sections admin all" ON public.home_sections;
CREATE POLICY "home_sections admin all" ON public.home_sections
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Banners table
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL REFERENCES public.home_sections(key) ON DELETE CASCADE,
  image_url_mobile text,
  image_url_desktop text,
  link_url text,
  title text,
  alt text,
  extra_text text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banners_section_idx ON public.banners (section_key, sort_order, is_active);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners public read" ON public.banners;
CREATE POLICY "banners public read" ON public.banners
  FOR SELECT USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

DROP POLICY IF EXISTS "banners admin all" ON public.banners;
CREATE POLICY "banners admin all" ON public.banners
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Updated recursive search_products function (supports child categories)
CREATE OR REPLACE FUNCTION public.search_products(
  q text DEFAULT NULL,
  cat_slug text DEFAULT NULL,
  lim int DEFAULT 24,
  off int DEFAULT 0
) RETURNS SETOF public.products
LANGUAGE sql STABLE
SET search_path = public
AS $$
  WITH RECURSIVE matched_cats AS (
    SELECT id FROM public.categories WHERE slug = cat_slug
    UNION ALL
    SELECT c.id FROM public.categories c
    INNER JOIN matched_cats mc ON c.parent_id = mc.id
  )
  SELECT p.*
  FROM public.products p
  JOIN public.categories c ON c.id = p.category_id
  WHERE p.is_visible
    AND (
      cat_slug IS NULL OR cat_slug = ''
      OR p.category_id IN (SELECT id FROM matched_cats)
    )
    AND (
      q IS NULL OR q = ''
      OR p.name ILIKE '%' || q || '%'
      OR c.name ILIKE '%' || q || '%'
      OR EXISTS (
        SELECT 1 FROM public.product_shades s
        WHERE s.product_id = p.id
          AND (s.name ILIKE '%' || q || '%' OR s.code ILIKE '%' || q || '%')
      )
    )
  ORDER BY p.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(lim, 24), 1), 48)
  OFFSET LEAST(GREATEST(COALESCE(off, 0), 0), 5000);
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text, text, int, int) TO anon, authenticated;

-- 6. Seed Home Sections (Highfy order)
INSERT INTO public.home_sections (key, title, type, bg_color, is_visible, sort_order) VALUES
  ('top_promo',        'Top Promo Banner',           'promo_strip',     '#0d3b27', true, 10),
  ('free_shipping',    'Free Shipping Strip',        'ticker',          '#1f2937', true, 20),
  ('hero_slider',      'Hero Slider',                'slider',          '#ffffff', true, 30),
  ('trust_cards',      'Trust Cards',                'grid_2',          '#ffffff', true, 40),
  ('category_icons',   'Shop by Category (Icons)',   'category_rail',   '#ffffff', true, 50),
  ('best_sellers',     'Best Sellers',               'product_rail',    '#ffffff', true, 60),
  ('must_haves',       'Must-Haves',                 'banner_grid',     '#ffffff', true, 70),
  ('shop_imported',    'Shop Imported',              'banner_slider',   '#ffffff', true, 80),
  ('korean_beauty',    'Korean Beauty Showcase',     'special_grid_3x3','#fdf2f8', true, 90),
  ('shop_local',       'Shop Local Pakistani Brands','banner_grid',     '#ffffff', true, 100),
  ('latest_drop',      'Latest Drop',                'product_rail',    '#ffffff', true, 110),
  ('premium',          'Premium Collection',         'banner_feature',  '#ffffff', true, 120),
  ('latest_news',      'Latest News & Skincare Tips','news_rail',       '#ffffff', true, 130),
  ('trust_icons',      'Trust Badges & Guarantees',  'badge_row',       '#f9fafb', true, 140),
  ('footer_text',      'Footer SEO & Brand Story',   'text_block',      '#ffffff', true, 150)
ON CONFLICT (key) DO NOTHING;

-- 7. Seed Banners / Sliders
INSERT INTO public.banners (section_key, title, extra_text, link_url, sort_order, is_active) VALUES
  ('top_promo', 'Ramadan & Eid Glow Hours | Up to 40% OFF', 'UPTO 40% OFF', '/categories/skincare', 10, true),
  ('free_shipping', 'Standard Express Delivery Rs. 199 Nationwide | Free delivery on orders above Rs. 4,999', 'FREE DELIVERY', '/categories', 10, true),
  ('hero_slider', 'Ramadan & Eid Glow Hours', 'Up to 40% OFF Top Skincare', '/categories/skincare', 10, true),
  ('hero_slider', '100% Authentic K-Beauty Imports', 'Glass Skin & Daily Sunscreens', '/categories/skincare-korean-beauty', 20, true),
  ('hero_slider', 'Signature Perfumes & Body Mists', 'Long-Lasting Luxury Fragrances', '/categories/perfumes', 30, true),
  ('trust_cards', '100% Authentic Guaranteed', 'Directly imported from verified brand distributors', '/categories', 10, true),
  ('trust_cards', 'Express Nationwide Delivery', 'Delivered in 24 to 72 hours across Pakistan', '/categories', 20, true),
  ('shop_imported', 'Shop 100% Original Imported Brands', 'CeraVe, Cosrx, Anua, The Ordinary', '/categories/skincare', 10, true),
  ('korean_beauty', 'Anua Heartleaf Soothing Toner', 'UPTO 30% OFF', '/categories/skincare-toners', 10, true),
  ('korean_beauty', 'Cosrx Advanced Snail 96 Mucin', 'UPTO 25% OFF', '/categories/skincare-serums-treatments', 20, true),
  ('korean_beauty', 'Beauty of Joseon Sun Relief', 'UPTO 35% OFF', '/categories/skincare-sun-protection', 30, true),
  ('korean_beauty', 'Axis-Y Dark Spot Correcting Glow', 'UPTO 20% OFF', '/categories/skincare-serums-treatments', 40, true),
  ('korean_beauty', 'Skin1004 Madagascar Centella Ampoule', 'UPTO 40% OFF', '/categories/skincare-serums-treatments', 50, true),
  ('korean_beauty', 'Haruharu Wonder Black Rice Toner', 'UPTO 25% OFF', '/categories/skincare-toners', 60, true),
  ('korean_beauty', 'Round Lab Birch Juice Moisturizing Sunscreen', 'UPTO 30% OFF', '/categories/skincare-sun-protection', 70, true),
  ('korean_beauty', 'Laneige Lip Sleeping Mask Berry', 'UPTO 15% OFF', '/categories/skincare-lip-treatments', 80, true),
  ('korean_beauty', 'Dr. Althea 345 Relief Cream', 'UPTO 20% OFF', '/categories/skincare-moisturizing-care', 90, true),
  ('shop_local', 'Shop High Quality Local Pakistani Brands', 'Medora, Vince, Bioaqua, Saeed Ghani', '/categories/makeup-nails', 10, true),
  ('premium', 'Luxury & High Performance Beauty', 'Curated premium cosmetics for salon and bridal finishes', '/categories', 10, true),
  ('trust_icons', '100% Authentic & Tested', 'Authenticity Guarantee', '/categories', 10, true),
  ('trust_icons', '24 - 72 Hours Dispatch', 'Express Shipping Across Pakistan', '/categories', 20, true),
  ('trust_icons', 'WhatsApp Order & Support', 'Direct Customer Care Assistance', '/cart', 30, true),
  ('footer_text', 'Classic Cosmetics Pakistan', 'Your trusted source for genuine beauty, skincare, and fragrances.', '/', 10, true)
ON CONFLICT DO NOTHING;

-- 8. Seed Menu Links
INSERT INTO public.menu_links (title, url, sort_order) VALUES
  ('Brands',            '/brands',                         10),
  ('Support',           '/support/about-us',               20),
  ('Review',            '/reviews',                        30),
  ('Track Your Order',  '/track-order',                    40)
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_links (parent_id, title, url, sort_order) VALUES
  ((SELECT id FROM public.menu_links WHERE title='Support' LIMIT 1), 'About Us',            '/support/about-us',             10),
  ((SELECT id FROM public.menu_links WHERE title='Support' LIMIT 1), 'Contact Us',          '/support/contact-us',           20),
  ((SELECT id FROM public.menu_links WHERE title='Support' LIMIT 1), 'FAQs',                '/support/faqs',                 30),
  ((SELECT id FROM public.menu_links WHERE title='Support' LIMIT 1), 'Return & Exchange',   '/support/return-and-exchange',  40)
ON CONFLICT DO NOTHING;

-- 9. Seed Full Category Tree (Highfy order, parent-path slugs, ON CONFLICT DO NOTHING)

-- LEVEL 1
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('Skincare',       'skincare',       10, null),
  ('Makeup & Nails', 'makeup-nails',   20, null),
  ('Perfumes',       'perfumes',       30, null),
  ('Haircare',       'haircare',       40, null),
  ('Bodycare',       'bodycare',       50, null),
  ('Beauty Tools',   'beauty-tools',   60, null),
  ('Personal Care',  'personal-care',  70, null)
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 2: Skincare
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('Face Cleansing',      'skincare-face-cleansing',     10, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Serums & Treatments', 'skincare-serums-treatments',  20, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Moisturizing Care',   'skincare-moisturizing-care',   30, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Sun Protection',      'skincare-sun-protection',      40, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Toners',              'skincare-toners',              50, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Lip Treatments',      'skincare-lip-treatments',      60, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Eye Treatments',      'skincare-eye-treatments',      70, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Skincare Set',        'skincare-skincare-set',        80, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Kids Collection',     'skincare-kids-collection',     90, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('For Men',             'skincare-for-men',            100, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('Korean Beauty',       'skincare-korean-beauty',      110, (SELECT id FROM public.categories WHERE slug='skincare')),
  ('All Skincare',        'skincare-all-skincare',       120, (SELECT id FROM public.categories WHERE slug='skincare'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 3: Skincare Children
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  -- Face Cleansing
  ('Face Wash',                   'skincare-face-cleansing-face-wash',                 10, (SELECT id FROM public.categories WHERE slug='skincare-face-cleansing')),
  ('Cleansers',                   'skincare-face-cleansing-cleansers',                 20, (SELECT id FROM public.categories WHERE slug='skincare-face-cleansing')),
  ('Cleansing Exfoliators',       'skincare-face-cleansing-cleansing-exfoliators',     30, (SELECT id FROM public.categories WHERE slug='skincare-face-cleansing')),
  ('Makeup Remover & Face Wipes', 'skincare-face-cleansing-makeup-remover-face-wipes', 40, (SELECT id FROM public.categories WHERE slug='skincare-face-cleansing')),
  -- Serums & Treatments
  ('Face Serums',                 'skincare-serums-treatments-face-serums',            10, (SELECT id FROM public.categories WHERE slug='skincare-serums-treatments')),
  ('Face Masks',                  'skincare-serums-treatments-face-masks',             20, (SELECT id FROM public.categories WHERE slug='skincare-serums-treatments')),
  ('Sheet Masks',                 'skincare-serums-treatments-sheet-masks',            30, (SELECT id FROM public.categories WHERE slug='skincare-serums-treatments')),
  -- Moisturizing Care
  ('Moisturizers',                'skincare-moisturizing-care-moisturizers',           10, (SELECT id FROM public.categories WHERE slug='skincare-moisturizing-care')),
  ('Day Creams',                  'skincare-moisturizing-care-day-creams',             20, (SELECT id FROM public.categories WHERE slug='skincare-moisturizing-care')),
  ('Night Creams',                'skincare-moisturizing-care-night-creams',           30, (SELECT id FROM public.categories WHERE slug='skincare-moisturizing-care')),
  -- Sun Protection
  ('Sunscreen',                   'skincare-sun-protection-sunscreen',                 10, (SELECT id FROM public.categories WHERE slug='skincare-sun-protection')),
  ('Mini Sunscreen',              'skincare-sun-protection-mini-sunscreen',            20, (SELECT id FROM public.categories WHERE slug='skincare-sun-protection')),
  ('Tinted Sunscreen',            'skincare-sun-protection-tinted-sunscreen',          30, (SELECT id FROM public.categories WHERE slug='skincare-sun-protection')),
  ('Body Sunscreen',              'skincare-sun-protection-body-sunscreen',            40, (SELECT id FROM public.categories WHERE slug='skincare-sun-protection')),
  -- Toners
  ('Hydrating Toner',             'skincare-toners-hydrating-toner',                   10, (SELECT id FROM public.categories WHERE slug='skincare-toners')),
  ('Exfoliating Toner',           'skincare-toners-exfoliating-toner',                 20, (SELECT id FROM public.categories WHERE slug='skincare-toners')),
  ('Toner Pads',                  'skincare-toners-toner-pads',                        30, (SELECT id FROM public.categories WHERE slug='skincare-toners')),
  ('Face Mists & Essence',        'skincare-toners-face-mists-essence',                40, (SELECT id FROM public.categories WHERE slug='skincare-toners')),
  -- Lip Treatments
  ('Lip Balm',                    'skincare-lip-treatments-lip-balm',                  10, (SELECT id FROM public.categories WHERE slug='skincare-lip-treatments')),
  ('Lip Mask & Scrubs',           'skincare-lip-treatments-lip-mask-scrubs',           20, (SELECT id FROM public.categories WHERE slug='skincare-lip-treatments')),
  -- Eye Treatments
  ('Eye Cream',                   'skincare-eye-treatments-eye-cream',                 10, (SELECT id FROM public.categories WHERE slug='skincare-eye-treatments')),
  ('Eye Serums',                  'skincare-eye-treatments-eye-serums',                20, (SELECT id FROM public.categories WHERE slug='skincare-eye-treatments')),
  ('Eye Masks',                   'skincare-eye-treatments-eye-masks',                 30, (SELECT id FROM public.categories WHERE slug='skincare-eye-treatments'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 2: Makeup & Nails
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('Face',                'makeup-nails-face',                10, (SELECT id FROM public.categories WHERE slug='makeup-nails')),
  ('Eyes',                'makeup-nails-eyes',                20, (SELECT id FROM public.categories WHERE slug='makeup-nails')),
  ('Lips',                'makeup-nails-lips',                30, (SELECT id FROM public.categories WHERE slug='makeup-nails')),
  ('Cheek',               'makeup-nails-cheek',               40, (SELECT id FROM public.categories WHERE slug='makeup-nails')),
  ('Blending Essentials', 'makeup-nails-blending-essentials', 50, (SELECT id FROM public.categories WHERE slug='makeup-nails')),
  ('Nail',                'makeup-nails-nail',                60, (SELECT id FROM public.categories WHERE slug='makeup-nails')),
  ('All Makeup',          'makeup-nails-all-makeup',          70, (SELECT id FROM public.categories WHERE slug='makeup-nails'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 3: Makeup & Nails Children
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  -- Face
  ('Foundation',                 'makeup-nails-face-foundation',                 10, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('BB Cream & Skin Tints',      'makeup-nails-face-bb-cream-skin-tints',        20, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Color Corrector',            'makeup-nails-face-color-corrector',            30, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Pot Concealer',              'makeup-nails-face-pot-concealer',              40, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Tube Concealer',             'makeup-nails-face-tube-concealer',             50, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Face Primer & Face Mists',   'makeup-nails-face-face-primer-face-mists',     60, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Compact Powder',             'makeup-nails-face-compact-powder',             70, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Setting Powder & Spray',     'makeup-nails-face-setting-powder-spray',       80, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Foundation Brushes',         'makeup-nails-face-foundation-brushes',         90, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  ('Face Palette',               'makeup-nails-face-face-palette',              100, (SELECT id FROM public.categories WHERE slug='makeup-nails-face')),
  -- Eyes
  ('Mascara',                    'makeup-nails-eyes-mascara',                    10, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('Eyeliner & Eye Pencils',     'makeup-nails-eyes-eyeliner-eye-pencils',       20, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('Kajal',                      'makeup-nails-eyes-kajal',                      30, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('Eye Primers',                'makeup-nails-eyes-eye-primers',                40, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('Eye Brows',                  'makeup-nails-eyes-eye-brows',                  50, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('Eye Shadow',                 'makeup-nails-eyes-eye-shadow',                 60, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('False Lashes & Eye Tools',   'makeup-nails-eyes-false-lashes-eye-tools',     70, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  ('Eye Brushes',                'makeup-nails-eyes-eye-brushes',                80, (SELECT id FROM public.categories WHERE slug='makeup-nails-eyes')),
  -- Lips
  ('Lipstick',                   'makeup-nails-lips-lipstick',                   10, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  ('Liquid Lipsticks',           'makeup-nails-lips-liquid-lipsticks',           20, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  ('Lipgloss & Tinted Lip Balms','makeup-nails-lips-lipgloss-tinted-lip-balms',  30, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  ('Lip Tints & Stains',         'makeup-nails-lips-lip-tints-stains',           40, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  ('Lip Liners & Crayons',       'makeup-nails-lips-lip-liners-crayons',         50, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  ('Lip Oils & Plumpers',        'makeup-nails-lips-lip-oils-plumpers',          60, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  ('Lip Brushes',                'makeup-nails-lips-lip-brushes',                70, (SELECT id FROM public.categories WHERE slug='makeup-nails-lips')),
  -- Cheek
  ('Blush',                      'makeup-nails-cheek-blush',                     10, (SELECT id FROM public.categories WHERE slug='makeup-nails-cheek')),
  ('Bronzer & Contour',          'makeup-nails-cheek-bronzer-contour',           20, (SELECT id FROM public.categories WHERE slug='makeup-nails-cheek')),
  ('Highlighter & Illuminators', 'makeup-nails-cheek-highlighter-illuminators',  30, (SELECT id FROM public.categories WHERE slug='makeup-nails-cheek')),
  ('Blush & Tint',               'makeup-nails-cheek-blush-tint',                40, (SELECT id FROM public.categories WHERE slug='makeup-nails-cheek')),
  -- Blending Essentials
  ('Blush Brushes',              'makeup-nails-blending-essentials-blush-brushes',   10, (SELECT id FROM public.categories WHERE slug='makeup-nails-blending-essentials')),
  ('Contour Brushes',            'makeup-nails-blending-essentials-contour-brushes', 20, (SELECT id FROM public.categories WHERE slug='makeup-nails-blending-essentials')),
  ('Beauty Sponges',             'makeup-nails-blending-essentials-beauty-sponges',  30, (SELECT id FROM public.categories WHERE slug='makeup-nails-blending-essentials')),
  -- Nail
  ('Nail Polish',                'makeup-nails-nail-nail-polish',                10, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Nail Polish Remover',        'makeup-nails-nail-nail-polish-remover',        20, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Nail Art & Tools',           'makeup-nails-nail-nail-art-tools',             30, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Press-On Nails',             'makeup-nails-nail-press-on-nails',             40, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Nail Glue',                  'makeup-nails-nail-nail-glue',                  50, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Cuticle Oil & Care',         'makeup-nails-nail-cuticle-oil-care',           60, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Nail Files & Buffers',       'makeup-nails-nail-nail-files-buffers',         70, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('Manicure Kits',              'makeup-nails-nail-manicure-kits',              80, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail')),
  ('UV/LED Lamps',               'makeup-nails-nail-uv-led-lamps',               90, (SELECT id FROM public.categories WHERE slug='makeup-nails-nail'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 2: Perfumes
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('For Men',          'perfumes-for-men',          10, (SELECT id FROM public.categories WHERE slug='perfumes')),
  ('For Women',        'perfumes-for-women',        20, (SELECT id FROM public.categories WHERE slug='perfumes')),
  ('Unisex Perfumes',  'perfumes-unisex-perfumes',  30, (SELECT id FROM public.categories WHERE slug='perfumes')),
  ('Air Fresheners',   'perfumes-air-fresheners',   40, (SELECT id FROM public.categories WHERE slug='perfumes')),
  ('All Perfumes',     'perfumes-all-perfumes',     50, (SELECT id FROM public.categories WHERE slug='perfumes'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 3: Perfumes Children
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  -- For Men
  ('Perfume - Men',               'perfumes-for-men-perfume',                 10, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  ('Miniatures - Men',            'perfumes-for-men-miniatures',              20, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  ('Attar',                       'perfumes-for-men-attar',                   30, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  ('Roll Ons & Body Sprays - Men','perfumes-for-men-roll-ons-body-sprays',    40, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  ('Aftershave',                  'perfumes-for-men-aftershave',              50, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  ('Bath & Shower',               'perfumes-for-men-bath-shower',             60, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  ('Cologne',                     'perfumes-for-men-cologne',                 70, (SELECT id FROM public.categories WHERE slug='perfumes-for-men')),
  -- For Women
  ('Perfume - Women',             'perfumes-for-women-perfume',               10, (SELECT id FROM public.categories WHERE slug='perfumes-for-women')),
  ('Miniatures - Women',          'perfumes-for-women-miniatures',            20, (SELECT id FROM public.categories WHERE slug='perfumes-for-women')),
  ('Body Mists',                  'perfumes-for-women-body-mists',            30, (SELECT id FROM public.categories WHERE slug='perfumes-for-women')),
  ('Bath & Shower',               'perfumes-for-women-bath-shower',           40, (SELECT id FROM public.categories WHERE slug='perfumes-for-women')),
  ('Hair Perfumes',               'perfumes-for-women-hair-perfumes',         50, (SELECT id FROM public.categories WHERE slug='perfumes-for-women')),
  ('Roll Ons & Body Sprays - Women','perfumes-for-women-roll-ons-body-sprays', 60, (SELECT id FROM public.categories WHERE slug='perfumes-for-women'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 2: Haircare
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('Shampoo & Conditioner', 'haircare-shampoo-conditioner', 10, (SELECT id FROM public.categories WHERE slug='haircare')),
  ('Hair Treatment',        'haircare-hair-treatment',        20, (SELECT id FROM public.categories WHERE slug='haircare')),
  ('Styling Products',      'haircare-styling-products',      30, (SELECT id FROM public.categories WHERE slug='haircare')),
  ('Hair Color',            'haircare-hair-color',            40, (SELECT id FROM public.categories WHERE slug='haircare')),
  ('Hair Styling & Tools',  'haircare-hair-styling-tools',    50, (SELECT id FROM public.categories WHERE slug='haircare')),
  ('Hair Accessories',      'haircare-hair-accessories',      60, (SELECT id FROM public.categories WHERE slug='haircare')),
  ('All Haircare',          'haircare-all-haircare',          70, (SELECT id FROM public.categories WHERE slug='haircare'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 3: Haircare Children
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  -- Shampoo & Conditioner
  ('Shampoo',                     'haircare-shampoo-conditioner-shampoo',                  10, (SELECT id FROM public.categories WHERE slug='haircare-shampoo-conditioner')),
  ('Conditioner',                 'haircare-shampoo-conditioner-conditioner',              20, (SELECT id FROM public.categories WHERE slug='haircare-shampoo-conditioner')),
  ('Dry Shampoo',                 'haircare-shampoo-conditioner-dry-shampoo',              30, (SELECT id FROM public.categories WHERE slug='haircare-shampoo-conditioner')),
  ('Leave-in Conditioner',        'haircare-shampoo-conditioner-leave-in-conditioner',     40, (SELECT id FROM public.categories WHERE slug='haircare-shampoo-conditioner')),
  -- Hair Treatment
  ('Hair Oil & Serums',           'haircare-hair-treatment-hair-oil-serums',               10, (SELECT id FROM public.categories WHERE slug='haircare-hair-treatment')),
  ('Hair Masks',                  'haircare-hair-treatment-hair-masks',                    20, (SELECT id FROM public.categories WHERE slug='haircare-hair-treatment')),
  ('Leave-in Treatment',          'haircare-hair-treatment-leave-in-treatment',            30, (SELECT id FROM public.categories WHERE slug='haircare-hair-treatment')),
  -- Styling Products
  ('Hairspray',                   'haircare-styling-products-hairspray',                   10, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  ('Hair Volume & Texture',       'haircare-styling-products-hair-volume-texture',         20, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  ('Heat Protectant',             'haircare-styling-products-heat-protectant',             30, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  ('Hair Gloss & Shine',          'haircare-styling-products-hair-gloss-shine',            40, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  ('Hair Smoothing',              'haircare-styling-products-hair-smoothing',              50, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  ('Curl Enhancing',              'haircare-styling-products-curl-enhancing',              60, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  ('Hair Wax & Gels',             'haircare-styling-products-hair-wax-gels',               70, (SELECT id FROM public.categories WHERE slug='haircare-styling-products')),
  -- Hair Color
  ('Root Touch Up',               'haircare-hair-color-root-touch-up',                     10, (SELECT id FROM public.categories WHERE slug='haircare-hair-color')),
  ('Hair Color & Bleach',         'haircare-hair-color-hair-color-bleach',                 20, (SELECT id FROM public.categories WHERE slug='haircare-hair-color')),
  -- Hair Styling & Tools
  ('Hair Straighteners & Flat Irons', 'haircare-hair-styling-tools-straighteners-flat-irons', 10, (SELECT id FROM public.categories WHERE slug='haircare-hair-styling-tools')),
  ('Hair Dryers',                 'haircare-hair-styling-tools-hair-dryers',                20, (SELECT id FROM public.categories WHERE slug='haircare-hair-styling-tools')),
  ('Curling Iron & Diffuser',     'haircare-hair-styling-tools-curling-iron-diffuser',      30, (SELECT id FROM public.categories WHERE slug='haircare-hair-styling-tools')),
  ('Hot Brushes',                 'haircare-hair-styling-tools-hot-brushes',                40, (SELECT id FROM public.categories WHERE slug='haircare-hair-styling-tools')),
  ('Hair Rollers',                'haircare-hair-styling-tools-hair-rollers',               50, (SELECT id FROM public.categories WHERE slug='haircare-hair-styling-tools')),
  -- Hair Accessories
  ('Hair Extensions',             'haircare-hair-accessories-hair-extensions',             10, (SELECT id FROM public.categories WHERE slug='haircare-hair-accessories')),
  ('Headbands',                   'haircare-hair-accessories-headbands',                   20, (SELECT id FROM public.categories WHERE slug='haircare-hair-accessories')),
  ('Clips & Bobby Pins',          'haircare-hair-accessories-clips-bobby-pins',            30, (SELECT id FROM public.categories WHERE slug='haircare-hair-accessories')),
  ('Hair Cutting Tools',          'haircare-hair-accessories-hair-cutting-tools',          40, (SELECT id FROM public.categories WHERE slug='haircare-hair-accessories'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 2: Bodycare
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('Bath & Shower',           'bodycare-bath-shower',           10, (SELECT id FROM public.categories WHERE slug='bodycare')),
  ('Body Moisturizers',       'bodycare-body-moisturizers',     20, (SELECT id FROM public.categories WHERE slug='bodycare')),
  ('Hand & Foot Care',        'bodycare-hand-foot-care',        30, (SELECT id FROM public.categories WHERE slug='bodycare')),
  ('Bath & Body Accessories', 'bodycare-bath-body-accessories', 40, (SELECT id FROM public.categories WHERE slug='bodycare')),
  ('Talcum Powder',           'bodycare-talcum-powder',         50, (SELECT id FROM public.categories WHERE slug='bodycare')),
  ('All Body Care',           'bodycare-all-body-care',         60, (SELECT id FROM public.categories WHERE slug='bodycare'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 3: Bodycare Children
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  -- Bath & Shower
  ('Body Scrubs & Exfoliants',       'bodycare-bath-shower-body-scrubs-exfoliants',      10, (SELECT id FROM public.categories WHERE slug='bodycare-bath-shower')),
  ('Shower Gel & Body Wash',         'bodycare-bath-shower-shower-gel-body-wash',        20, (SELECT id FROM public.categories WHERE slug='bodycare-bath-shower')),
  -- Body Moisturizers
  ('Body Lotions & Creams',          'bodycare-body-moisturizers-body-lotions-creams',   10, (SELECT id FROM public.categories WHERE slug='bodycare-body-moisturizers')),
  ('Body Serums & Oils',             'bodycare-body-moisturizers-body-serums-oils',      20, (SELECT id FROM public.categories WHERE slug='bodycare-body-moisturizers')),
  ('Body Butters',                   'bodycare-body-moisturizers-body-butters',          30, (SELECT id FROM public.categories WHERE slug='bodycare-body-moisturizers')),
  -- Hand & Foot Care
  ('Hand & Foot Cream',              'bodycare-hand-foot-care-hand-foot-cream',          10, (SELECT id FROM public.categories WHERE slug='bodycare-hand-foot-care')),
  ('Hand & Foot Mask Treatment',     'bodycare-hand-foot-care-hand-foot-mask-treatment', 20, (SELECT id FROM public.categories WHERE slug='bodycare-hand-foot-care')),
  ('Manicure & Pedicure Tools',      'bodycare-hand-foot-care-manicure-pedicure-tools',  30, (SELECT id FROM public.categories WHERE slug='bodycare-hand-foot-care')),
  ('Soaps & Sanitizers',             'bodycare-hand-foot-care-soaps-sanitizers',         40, (SELECT id FROM public.categories WHERE slug='bodycare-hand-foot-care')),
  -- Bath & Body Accessories
  ('Bath Sponges, Gloves & Brushes', 'bodycare-bath-body-accessories-bath-sponges-gloves-brushes', 10, (SELECT id FROM public.categories WHERE slug='bodycare-bath-body-accessories')),
  ('Hair Towels & Shower Caps',      'bodycare-bath-body-accessories-hair-towels-shower-caps',      20, (SELECT id FROM public.categories WHERE slug='bodycare-bath-body-accessories'))
ON CONFLICT (slug) DO NOTHING;

-- LEVEL 2: Personal Care
INSERT INTO public.categories (name, slug, sort_order, parent_id) VALUES
  ('Supplements',                 'personal-care-supplements',                  10, (SELECT id FROM public.categories WHERE slug='personal-care')),
  ('Hair Removal',                'personal-care-hair-removal',                 20, (SELECT id FROM public.categories WHERE slug='personal-care')),
  ('Pregnancy & Maternity Care',  'personal-care-pregnancy-maternity-care',   30, (SELECT id FROM public.categories WHERE slug='personal-care')),
  ('Menstrual Care',              'personal-care-menstrual-care',               40, (SELECT id FROM public.categories WHERE slug='personal-care')),
  ('Hygiene (Oral Hygiene)',       'personal-care-hygiene-oral-hygiene',         50, (SELECT id FROM public.categories WHERE slug='personal-care')),
  ('Sexual Wellness',             'personal-care-sexual-wellness',              60, (SELECT id FROM public.categories WHERE slug='personal-care'))
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ── DRY RUN VERIFICATION QUERY ─────────────────────────────────────────
-- Run this SELECT query to inspect what was inserted:
-- SELECT id, name, slug, parent_id, sort_order, show_in_menu, is_active FROM public.categories ORDER BY sort_order, name;
-- SELECT * FROM public.menu_links ORDER BY sort_order;
-- SELECT * FROM public.home_sections ORDER BY sort_order;
-- SELECT * FROM public.banners ORDER BY section_key, sort_order;

-- ── ROLLBACK SCRIPT ────────────────────────────────────────────────────
-- To safely rollback ONLY new structures created by this migration if needed:
-- DROP TABLE IF EXISTS public.banners CASCADE;
-- DROP TABLE IF EXISTS public.home_sections CASCADE;
-- DROP TABLE IF EXISTS public.menu_links CASCADE;
-- DELETE FROM public.categories WHERE slug IN (
--   'skincare-face-cleansing', 'skincare-serums-treatments', ... [new slugs]
-- );
