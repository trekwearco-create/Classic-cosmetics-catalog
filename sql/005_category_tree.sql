-- Migration 005: Add parent_id to categories for unlimited-depth tree.
-- ADDITIVE ONLY — no columns/tables dropped or renamed.
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).

-- 1. Add parent_id (nullable self-reference)
alter table public.categories
  add column if not exists parent_id uuid
    references public.categories(id) on delete set null;

create index if not exists categories_parent_idx
  on public.categories (parent_id);

-- 2. Add description for categories
alter table public.categories
  add column if not exists description text;

-- 3. Add show_in_menu flag
alter table public.categories
  add column if not exists show_in_menu boolean not null default true;

-- 4. Seed the full 3-level category tree (all editable from admin after this).
--    Uses ON CONFLICT DO NOTHING so re-running is safe.
--    Level 1 categories first, then level 2, then level 3.

-- ── LEVEL 1 ──────────────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Skincare',       'skincare',       10, null),
  ('Makeup & Nails', 'makeup-nails',   20, null),
  ('Perfumes',       'perfumes',       30, null),
  ('Haircare',       'haircare',       40, null),
  ('Bodycare',       'bodycare',       50, null),
  ('Beauty Tools',   'beauty-tools',   60, null),
  ('Personal Care',  'personal-care',  70, null)
on conflict (slug) do update set sort_order = excluded.sort_order, parent_id = null;

-- ── LEVEL 2: SKINCARE ────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Face Cleansing',      'face-cleansing',     10, (select id from public.categories where slug='skincare')),
  ('Serums & Treatments', 'serums-treatments',  20, (select id from public.categories where slug='skincare')),
  ('Moisturizing Care',   'moisturizing-care',  30, (select id from public.categories where slug='skincare')),
  ('Sun Protection',      'sun-protection',     40, (select id from public.categories where slug='skincare')),
  ('Toners',              'toners',             50, (select id from public.categories where slug='skincare')),
  ('Lip Treatments',      'lip-treatments',     60, (select id from public.categories where slug='skincare')),
  ('Eye Treatments',      'eye-treatments',     70, (select id from public.categories where slug='skincare')),
  ('Skincare Sets',       'skincare-sets',      80, (select id from public.categories where slug='skincare')),
  ('Kids Collection',     'kids-collection',    90, (select id from public.categories where slug='skincare')),
  ('For Men',             'skincare-for-men',  100, (select id from public.categories where slug='skincare')),
  ('Korean Beauty',       'korean-beauty',     110, (select id from public.categories where slug='skincare'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 2: MAKEUP & NAILS ──────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Face',                'makeup-face',        10, (select id from public.categories where slug='makeup-nails')),
  ('Eyes',                'makeup-eyes',        20, (select id from public.categories where slug='makeup-nails')),
  ('Lips',                'makeup-lips',        30, (select id from public.categories where slug='makeup-nails')),
  ('Cheek',               'makeup-cheek',       40, (select id from public.categories where slug='makeup-nails')),
  ('Blending Essentials', 'blending-essentials',50, (select id from public.categories where slug='makeup-nails')),
  ('Nail',                'nail',               60, (select id from public.categories where slug='makeup-nails'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 2: PERFUMES ────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('For Men',       'perfumes-for-men',  10, (select id from public.categories where slug='perfumes')),
  ('For Women',     'perfumes-for-women',20, (select id from public.categories where slug='perfumes')),
  ('Unisex',        'unisex-perfumes',   30, (select id from public.categories where slug='perfumes')),
  ('Air Fresheners','air-fresheners',    40, (select id from public.categories where slug='perfumes'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 2: HAIRCARE ────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Shampoo & Conditioner', 'shampoo-conditioner', 10, (select id from public.categories where slug='haircare')),
  ('Hair Treatment',         'hair-treatment',      20, (select id from public.categories where slug='haircare')),
  ('Styling Products',       'styling-products',    30, (select id from public.categories where slug='haircare')),
  ('Hair Color',             'hair-color',          40, (select id from public.categories where slug='haircare')),
  ('Hair Styling & Tools',   'hair-tools',          50, (select id from public.categories where slug='haircare')),
  ('Hair Accessories',       'hair-accessories',    60, (select id from public.categories where slug='haircare'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 2: BODYCARE ────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Bath & Shower',           'bath-shower',         10, (select id from public.categories where slug='bodycare')),
  ('Body Moisturizers',        'body-moisturizers',   20, (select id from public.categories where slug='bodycare')),
  ('Hand & Foot Care',         'hand-foot-care',      30, (select id from public.categories where slug='bodycare')),
  ('Bath & Body Accessories',  'bath-body-accessories',40, (select id from public.categories where slug='bodycare')),
  ('Talcum Powder',            'talcum-powder',        50, (select id from public.categories where slug='bodycare'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 2: PERSONAL CARE ───────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Supplements',           'supplements',           10, (select id from public.categories where slug='personal-care')),
  ('Hair Removal',          'hair-removal',          20, (select id from public.categories where slug='personal-care')),
  ('Pregnancy & Maternity', 'pregnancy-maternity',   30, (select id from public.categories where slug='personal-care')),
  ('Menstrual Care',        'menstrual-care',        40, (select id from public.categories where slug='personal-care')),
  ('Oral Hygiene',          'oral-hygiene',          50, (select id from public.categories where slug='personal-care')),
  ('Sexual Wellness',       'sexual-wellness',       60, (select id from public.categories where slug='personal-care'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: FACE CLEANSING ──────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Face Wash',                   'face-wash',                  10, (select id from public.categories where slug='face-cleansing')),
  ('Cleansers',                   'cleansers',                  20, (select id from public.categories where slug='face-cleansing')),
  ('Cleansing Exfoliators',       'cleansing-exfoliators',      30, (select id from public.categories where slug='face-cleansing')),
  ('Makeup Remover & Face Wipes', 'makeup-remover-face-wipes',  40, (select id from public.categories where slug='face-cleansing'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: SERUMS & TREATMENTS ─────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Face Serums',  'face-serums',  10, (select id from public.categories where slug='serums-treatments')),
  ('Face Masks',   'face-masks',   20, (select id from public.categories where slug='serums-treatments')),
  ('Sheet Masks',  'sheet-masks',  30, (select id from public.categories where slug='serums-treatments'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: MOISTURIZING CARE ───────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Moisturizers',  'moisturizers', 10, (select id from public.categories where slug='moisturizing-care')),
  ('Day Creams',    'day-creams',   20, (select id from public.categories where slug='moisturizing-care')),
  ('Night Creams',  'night-creams', 30, (select id from public.categories where slug='moisturizing-care'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: SUN PROTECTION ──────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Sunscreen',          'sunscreen',          10, (select id from public.categories where slug='sun-protection')),
  ('Mini Sunscreen',     'mini-sunscreen',     20, (select id from public.categories where slug='sun-protection')),
  ('Tinted Sunscreen',   'tinted-sunscreen',   30, (select id from public.categories where slug='sun-protection')),
  ('Body Sunscreen',     'body-sunscreen',     40, (select id from public.categories where slug='sun-protection'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: TONERS ──────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Hydrating Toner',      'hydrating-toner',      10, (select id from public.categories where slug='toners')),
  ('Exfoliating Toner',    'exfoliating-toner',    20, (select id from public.categories where slug='toners')),
  ('Toner Pads',           'toner-pads',           30, (select id from public.categories where slug='toners')),
  ('Face Mists & Essence', 'face-mists-essence',   40, (select id from public.categories where slug='toners'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: LIP TREATMENTS ──────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Lip Balm',          'lip-balm',          10, (select id from public.categories where slug='lip-treatments')),
  ('Lip Mask & Scrubs', 'lip-mask-scrubs',   20, (select id from public.categories where slug='lip-treatments'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: EYE TREATMENTS ──────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Eye Cream',   'eye-cream',   10, (select id from public.categories where slug='eye-treatments')),
  ('Eye Serums',  'eye-serums',  20, (select id from public.categories where slug='eye-treatments')),
  ('Eye Masks',   'eye-masks',   30, (select id from public.categories where slug='eye-treatments'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: MAKEUP FACE ─────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Foundation',                   'foundation',            10, (select id from public.categories where slug='makeup-face')),
  ('BB Cream & Skin Tints',        'bb-cream-skin-tints',   20, (select id from public.categories where slug='makeup-face')),
  ('Color Corrector',              'color-corrector',       30, (select id from public.categories where slug='makeup-face')),
  ('Pot Concealer',                'pot-concealer',         40, (select id from public.categories where slug='makeup-face')),
  ('Tube Concealer',               'tube-concealer',        50, (select id from public.categories where slug='makeup-face')),
  ('Face Primer & Mists',          'face-primer-mists',     60, (select id from public.categories where slug='makeup-face')),
  ('Compact Powder',               'compact-powder',        70, (select id from public.categories where slug='makeup-face')),
  ('Setting Powder & Spray',       'setting-powder-spray',  80, (select id from public.categories where slug='makeup-face')),
  ('Foundation Brushes',           'foundation-brushes',    90, (select id from public.categories where slug='makeup-face')),
  ('Face Palette',                 'face-palette',         100, (select id from public.categories where slug='makeup-face'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: MAKEUP EYES ─────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Mascara',                    'mascara',               10, (select id from public.categories where slug='makeup-eyes')),
  ('Eyeliner & Eye Pencils',     'eyeliner-eye-pencils',  20, (select id from public.categories where slug='makeup-eyes')),
  ('Kajal',                      'kajal',                 30, (select id from public.categories where slug='makeup-eyes')),
  ('Eye Primers',                'eye-primers',           40, (select id from public.categories where slug='makeup-eyes')),
  ('Eye Brows',                  'eye-brows',             50, (select id from public.categories where slug='makeup-eyes')),
  ('Eye Shadow',                 'eye-shadow',            60, (select id from public.categories where slug='makeup-eyes')),
  ('False Lashes & Eye Tools',   'false-lashes-eye-tools',70, (select id from public.categories where slug='makeup-eyes')),
  ('Eye Brushes',                'eye-brushes',           80, (select id from public.categories where slug='makeup-eyes'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: MAKEUP LIPS ─────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Lipstick',                     'lipstick-makeup',        10, (select id from public.categories where slug='makeup-lips')),
  ('Liquid Lipsticks',             'liquid-lipsticks',       20, (select id from public.categories where slug='makeup-lips')),
  ('Lipgloss & Tinted Lip Balms',  'lipgloss-tinted-balms',  30, (select id from public.categories where slug='makeup-lips')),
  ('Lip Tints & Stains',           'lip-tints-stains',       40, (select id from public.categories where slug='makeup-lips')),
  ('Lip Liners & Crayons',         'lip-liners-crayons',     50, (select id from public.categories where slug='makeup-lips')),
  ('Lip Oils & Plumpers',          'lip-oils-plumpers',      60, (select id from public.categories where slug='makeup-lips')),
  ('Lip Brushes',                  'lip-brushes',            70, (select id from public.categories where slug='makeup-lips'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: MAKEUP CHEEK ────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Blush',                   'blush',                10, (select id from public.categories where slug='makeup-cheek')),
  ('Bronzer & Contour',       'bronzer-contour',      20, (select id from public.categories where slug='makeup-cheek')),
  ('Highlighter & Illuminators','highlighter-illuminators',30, (select id from public.categories where slug='makeup-cheek')),
  ('Blush & Tint',            'blush-tint',           40, (select id from public.categories where slug='makeup-cheek'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: BLENDING ESSENTIALS ─────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Blush Brushes',    'blush-brushes',    10, (select id from public.categories where slug='blending-essentials')),
  ('Contour Brushes',  'contour-brushes',  20, (select id from public.categories where slug='blending-essentials')),
  ('Beauty Sponges',   'beauty-sponges',   30, (select id from public.categories where slug='blending-essentials'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: NAIL ────────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Nail Polish',          'nail-polish-cat',    10, (select id from public.categories where slug='nail')),
  ('Nail Polish Remover',  'nail-polish-remover',20, (select id from public.categories where slug='nail')),
  ('Nail Art & Tools',     'nail-art-tools',     30, (select id from public.categories where slug='nail')),
  ('Press-On Nails',       'press-on-nails',     40, (select id from public.categories where slug='nail')),
  ('Nail Glue',            'nail-glue',          50, (select id from public.categories where slug='nail')),
  ('Cuticle Oil & Care',   'cuticle-oil-care',   60, (select id from public.categories where slug='nail')),
  ('Nail Files & Buffers', 'nail-files-buffers', 70, (select id from public.categories where slug='nail')),
  ('Manicure Kits',        'manicure-kits',      80, (select id from public.categories where slug='nail')),
  ('UV/LED Lamps',         'uv-led-lamps',       90, (select id from public.categories where slug='nail'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: PERFUMES FOR MEN ────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Perfume',             'mens-perfume',        10, (select id from public.categories where slug='perfumes-for-men')),
  ('Miniatures',          'mens-miniatures',     20, (select id from public.categories where slug='perfumes-for-men')),
  ('Attar',               'attar',               30, (select id from public.categories where slug='perfumes-for-men')),
  ('Roll Ons & Body Sprays','mens-roll-ons',     40, (select id from public.categories where slug='perfumes-for-men')),
  ('Aftershave',          'aftershave',          50, (select id from public.categories where slug='perfumes-for-men')),
  ('Bath & Shower Men',   'bath-shower-men',     60, (select id from public.categories where slug='perfumes-for-men')),
  ('Cologne',             'cologne',             70, (select id from public.categories where slug='perfumes-for-men'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: PERFUMES FOR WOMEN ──────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Perfume',               'womens-perfume',       10, (select id from public.categories where slug='perfumes-for-women')),
  ('Miniatures',            'womens-miniatures',    20, (select id from public.categories where slug='perfumes-for-women')),
  ('Body Mists',            'body-mists',           30, (select id from public.categories where slug='perfumes-for-women')),
  ('Bath & Shower Women',   'bath-shower-women',    40, (select id from public.categories where slug='perfumes-for-women')),
  ('Hair Perfumes',         'hair-perfumes',        50, (select id from public.categories where slug='perfumes-for-women')),
  ('Roll Ons & Body Sprays','womens-roll-ons',      60, (select id from public.categories where slug='perfumes-for-women'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: HAIRCARE ────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Shampoo',              'shampoo',              10, (select id from public.categories where slug='shampoo-conditioner')),
  ('Conditioner',          'conditioner',          20, (select id from public.categories where slug='shampoo-conditioner')),
  ('Dry Shampoo',          'dry-shampoo',          30, (select id from public.categories where slug='shampoo-conditioner')),
  ('Leave-in Conditioner', 'leave-in-conditioner', 40, (select id from public.categories where slug='shampoo-conditioner'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Hair Oil & Serums',  'hair-oil-serums',  10, (select id from public.categories where slug='hair-treatment')),
  ('Hair Masks',         'hair-masks',       20, (select id from public.categories where slug='hair-treatment')),
  ('Leave-in Treatment', 'leave-in-treatment',30, (select id from public.categories where slug='hair-treatment'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Hairspray',          'hairspray',           10, (select id from public.categories where slug='styling-products')),
  ('Hair Volume & Texture','hair-volume-texture',20, (select id from public.categories where slug='styling-products')),
  ('Heat Protectant',    'heat-protectant',     30, (select id from public.categories where slug='styling-products')),
  ('Hair Gloss & Shine', 'hair-gloss-shine',    40, (select id from public.categories where slug='styling-products')),
  ('Hair Smoothing',     'hair-smoothing',      50, (select id from public.categories where slug='styling-products')),
  ('Curl Enhancing',     'curl-enhancing',      60, (select id from public.categories where slug='styling-products')),
  ('Hair Wax & Gels',    'hair-wax-gels',       70, (select id from public.categories where slug='styling-products'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Root Touch Up',        'root-touch-up',      10, (select id from public.categories where slug='hair-color')),
  ('Hair Color & Bleach',  'hair-color-bleach',  20, (select id from public.categories where slug='hair-color'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Straighteners & Flat Irons',  'straighteners-flat-irons', 10, (select id from public.categories where slug='hair-tools')),
  ('Hair Dryers',                  'hair-dryers',              20, (select id from public.categories where slug='hair-tools')),
  ('Curling Iron & Diffuser',      'curling-iron-diffuser',    30, (select id from public.categories where slug='hair-tools')),
  ('Hot Brushes',                  'hot-brushes',              40, (select id from public.categories where slug='hair-tools')),
  ('Hair Rollers',                 'hair-rollers',             50, (select id from public.categories where slug='hair-tools'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Hair Extensions',    'hair-extensions',   10, (select id from public.categories where slug='hair-accessories')),
  ('Headbands',          'headbands',         20, (select id from public.categories where slug='hair-accessories')),
  ('Clips & Bobby Pins', 'clips-bobby-pins',  30, (select id from public.categories where slug='hair-accessories')),
  ('Hair Cutting Tools', 'hair-cutting-tools',40, (select id from public.categories where slug='hair-accessories'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ── LEVEL 3: BODYCARE ────────────────────────────────────────────────
insert into public.categories (name, slug, sort_order, parent_id) values
  ('Body Scrubs & Exfoliants', 'body-scrubs',     10, (select id from public.categories where slug='bath-shower')),
  ('Shower Gel & Body Wash',   'shower-gel',      20, (select id from public.categories where slug='bath-shower'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Body Lotions & Creams',  'body-lotions-creams', 10, (select id from public.categories where slug='body-moisturizers')),
  ('Body Serums & Oils',     'body-serums-oils',    20, (select id from public.categories where slug='body-moisturizers')),
  ('Body Butters',           'body-butters',        30, (select id from public.categories where slug='body-moisturizers'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Hand & Foot Cream',          'hand-foot-cream',        10, (select id from public.categories where slug='hand-foot-care')),
  ('Hand & Foot Mask Treatment', 'hand-foot-mask',          20, (select id from public.categories where slug='hand-foot-care')),
  ('Manicure & Pedicure Tools',  'manicure-pedicure-tools', 30, (select id from public.categories where slug='hand-foot-care')),
  ('Soaps & Sanitizers',         'soaps-sanitizers',        40, (select id from public.categories where slug='hand-foot-care'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

insert into public.categories (name, slug, sort_order, parent_id) values
  ('Bath Sponges Gloves & Brushes', 'bath-sponges',       10, (select id from public.categories where slug='bath-body-accessories')),
  ('Hair Towels & Shower Caps',     'hair-towels',         20, (select id from public.categories where slug='bath-body-accessories'))
on conflict (slug) do update set parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- Old 4 flat seed categories are now unmapped; admin can delete or reparent them.
-- Keeping them alive so existing FK references in products don't break.
