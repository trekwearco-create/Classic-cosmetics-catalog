import "server-only";

import { unstable_cache } from "next/cache";

import { supabasePublic } from "@/lib/supabase/server";
import { log } from "@/lib/log";

export const PAGE_SIZE = 24;
const PUBLIC_CATALOG_TAG = "public-catalog";

export function escapeSearchText(raw: string): string {
  return raw
    .trim()
    .slice(0, 60)
    .replace(/[\\%_]/g, (c) => `\\${c}`);
}

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  parent_id?: string | null;
  show_in_menu?: boolean;
  show_in_homepage?: boolean;
  is_active?: boolean;
  description?: string | null;
};

export type ProductCardRow = {
  id: string;
  slug: string;
  name: string;
  in_stock: boolean;
  category_name: string;
  cover_url: string | null;
  shade_colors: string[];
  price: number | null;
  discount_price: number | null;
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  parent_id: string | null;
  show_in_menu: boolean;
  is_active: boolean;
  children: CategoryTreeNode[];
};

export type HomeSectionRow = {
  key: string;
  title: string;
  type: string;
  bg_color: string | null;
  is_visible: boolean;
  sort_order: number;
};

export type BannerRow = {
  id: string;
  section_key: string;
  image_url_mobile: string | null;
  image_url_desktop: string | null;
  link_url: string | null;
  title: string | null;
  alt: string | null;
  extra_text: string | null;
  sort_order: number;
  is_active: boolean;
};

export type HomeSectionWithBanners = HomeSectionRow & {
  banners: BannerRow[];
};

export type MenuLinkRow = {
  id: string;
  parent_id: string | null;
  title: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  children?: MenuLinkRow[];
};

export const PUBLIC_BANNERS_TAG = "public-banners";

async function loadCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = supabasePublic();
    // Try full schema first
    const fullRes = await supabase
      .from("categories")
      .select("id, name, slug, image_url, sort_order, parent_id, show_in_menu, show_in_homepage, is_active, description")
      .order("sort_order")
      .order("name");
    if (!fullRes.error && fullRes.data) {
      return fullRes.data as CategoryRow[];
    }

    // Fallback if migration not applied yet
    const fallbackRes = await supabase
      .from("categories")
      .select("id, name, slug, image_url, sort_order")
      .order("sort_order")
      .order("name");
    if (fallbackRes.error) {
      log.warn("public categories query failed", { code: fallbackRes.error.code });
      return [];
    }
    return (fallbackRes.data ?? []).map((c) => ({
      ...c,
      parent_id: null,
      show_in_menu: true,
      show_in_homepage: false,
      is_active: true,
      description: null,
    })) as CategoryRow[];
  } catch {
    log.warn("public categories query failed");
    return [];
  }
}

const cachedCategories = unstable_cache(loadCategories, ["public-categories"], {
  revalidate: 1800,
  tags: [PUBLIC_CATALOG_TAG],
});

export async function listCategories(): Promise<CategoryRow[]> {
  return cachedCategories();
}

export async function listHomepageCategories(): Promise<CategoryRow[]> {
  const all = await listCategories();
  const active = all.filter((c) => c.is_active !== false);
  const featured = active.filter((c) => c.show_in_homepage === true);
  if (featured.length > 0) {
    return featured.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }
  // Fall back to top-level active categories if none selected
  return active
    .filter((c) => !c.parent_id)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export function buildCategoryTree(flat: CategoryRow[]): CategoryTreeNode[] {
  const activeList = flat.filter((c) => c.is_active !== false);
  const byId = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const item of activeList) {
    byId.set(item.id, {
      id: item.id,
      name: item.name,
      slug: item.slug,
      image_url: item.image_url,
      sort_order: item.sort_order,
      parent_id: item.parent_id ?? null,
      show_in_menu: item.show_in_menu !== false,
      is_active: item.is_active !== false,
      children: [],
    });
  }

  for (const item of activeList) {
    const node = byId.get(item.id)!;
    if (item.parent_id && byId.has(item.parent_id)) {
      byId.get(item.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    for (const n of nodes) {
      if (n.children.length > 0) sortNodes(n.children);
    }
  };
  sortNodes(roots);
  return roots;
}

export async function listCategoryTree(): Promise<CategoryTreeNode[]> {
  const flat = await listCategories();
  return buildCategoryTree(flat);
}

async function loadHomeSectionsWithBanners(): Promise<HomeSectionWithBanners[]> {
  try {
    const supabase = supabasePublic();
    const [sectionsRes, bannersRes] = await Promise.all([
      supabase
        .from("home_sections")
        .select("key, title, type, bg_color, is_visible, sort_order")
        .eq("is_visible", true)
        .order("sort_order"),
      supabase
        .from("banners")
        .select("id, section_key, image_url_mobile, image_url_desktop, link_url, title, alt, extra_text, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    if (sectionsRes.error || bannersRes.error) {
      return [];
    }

    const bannersBySection = new Map<string, BannerRow[]>();
    for (const b of (bannersRes.data ?? []) as BannerRow[]) {
      const list = bannersBySection.get(b.section_key) ?? [];
      list.push(b);
      bannersBySection.set(b.section_key, list);
    }

    const sections = (sectionsRes.data ?? []) as HomeSectionRow[];
    return sections.map((s) => ({
      ...s,
      banners: bannersBySection.get(s.key) ?? [],
    }));
  } catch {
    return [];
  }
}

export const getHomeSectionsWithBanners = unstable_cache(
  loadHomeSectionsWithBanners,
  ["public-home-sections"],
  {
    revalidate: 1800,
    tags: [PUBLIC_BANNERS_TAG],
  },
);

async function loadMenuLinks(): Promise<MenuLinkRow[]> {
  try {
    const supabase = supabasePublic();
    const { data, error } = await supabase
      .from("menu_links")
      .select("id, parent_id, title, url, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order");
    if (error || !data) return [];

    const byId = new Map<string, MenuLinkRow>();
    const roots: MenuLinkRow[] = [];
    for (const item of data as MenuLinkRow[]) {
      byId.set(item.id, { ...item, children: [] });
    }
    for (const item of data as MenuLinkRow[]) {
      const node = byId.get(item.id)!;
      if (item.parent_id && byId.has(item.parent_id)) {
        byId.get(item.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  } catch {
    return [];
  }
}

export const getMenuLinks = unstable_cache(
  loadMenuLinks,
  ["public-menu-links"],
  {
    revalidate: 1800,
    tags: [PUBLIC_BANNERS_TAG],
  },
);

type SearchArgs = {
  q: string | null;
  category: string | null;
  page: number;
};

async function loadProductCards({
  q,
  category,
  page,
}: SearchArgs): Promise<ProductCardRow[]> {
  try {
    const supabase = supabasePublic();
    const trimmed = escapeSearchText(q ?? "");
    const cat = category && category !== "" ? category : null;
    const offset = (page - 1) * PAGE_SIZE;

    const { data, error } = await supabase.rpc("search_products", {
      q: trimmed === "" ? null : trimmed,
      cat_slug: cat,
      lim: PAGE_SIZE,
      off: offset,
    });
    if (error) {
      log.warn("public product search failed", { code: error.code });
      return [];
    }
    const rows = (data ?? []) as Array<{
      id: string;
      slug: string;
      name: string;
      category_id: string;
      in_stock: boolean;
      price: number | null;
      discount_price: number | null;
    }>;

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const [imagesRes, categoriesRes, shadesRes] = await Promise.all([
      supabase
        .from("product_images")
        .select("product_id, image_url, is_cover, sort_order")
        .in("product_id", ids)
        .order("sort_order"),
      supabase.from("categories").select("id, name"),
      supabase
        .from("product_shades")
        .select("product_id, color_hex")
        .in("product_id", ids)
        .not("color_hex", "is", null),
    ]);
    if (imagesRes.error) {
      log.warn("public product images query failed", {
        code: imagesRes.error.code,
      });
    }
    if (categoriesRes.error) {
      log.warn("public category names query failed", {
        code: categoriesRes.error.code,
      });
    }
    if (shadesRes.error) {
      log.warn("public product shades query failed", {
        code: shadesRes.error.code,
      });
    }

    const coverByProduct = new Map<string, string>();
    const firstByProduct = new Map<string, string>();
    for (const img of imagesRes.data ?? []) {
      const key = img.product_id;
      if (img.is_cover && !coverByProduct.has(key)) {
        coverByProduct.set(key, img.image_url);
      }
      if (!firstByProduct.has(key)) {
        firstByProduct.set(key, img.image_url);
      }
    }
    const categoryNameById = new Map(
      (categoriesRes.data ?? []).map((item) => [item.id, item.name]),
    );
    const shadesByProduct = new Map<string, string[]>();
    for (const shade of shadesRes.data ?? []) {
      if (!shade.color_hex) continue;
      const colors = shadesByProduct.get(shade.product_id) ?? [];
      colors.push(shade.color_hex);
      shadesByProduct.set(shade.product_id, colors);
    }

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      in_stock: r.in_stock,
      category_name: categoryNameById.get(r.category_id) ?? "",
      cover_url:
        coverByProduct.get(r.id) ?? firstByProduct.get(r.id) ?? null,
      shade_colors: shadesByProduct.get(r.id) ?? [],
      price: r.price ?? null,
      discount_price: r.discount_price ?? null,
    }));
  } catch {
    log.warn("public product search failed");
    return [];
  }
}

const cachedProductCards = unstable_cache(
  async (q: string | null, category: string | null, page: number) =>
    loadProductCards({ q, category, page }),
  ["public-product-cards"],
  { revalidate: 1800, tags: [PUBLIC_CATALOG_TAG] },
);

export async function searchProductCards(args: SearchArgs): Promise<ProductCardRow[]> {
  return cachedProductCards(args.q, args.category, args.page);
}

export async function getBestSellers(limit = 8): Promise<ProductCardRow[]> {
  try {
    const supabase = supabasePublic();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, in_stock, category_id, price, discount_price, is_best_seller",
      )
      .eq("is_visible", true)
      .eq("is_best_seller", true)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      // Fallback: return top discounted products
      const cards = await searchProductCards({ q: null, category: null, page: 1 });
      const sorted = [...cards].sort((a, b) => {
        const aDiscount = a.price && a.discount_price ? (a.price - a.discount_price) / a.price : 0;
        const bDiscount = b.price && b.discount_price ? (b.price - b.discount_price) / b.price : 0;
        return bDiscount - aDiscount;
      });
      return sorted.slice(0, limit);
    }

    const ids = data.map((r: { id: string }) => r.id);
    const [imagesRes, categoriesRes, shadesRes] = await Promise.all([
      supabase
        .from("product_images")
        .select("product_id, image_url, is_cover, sort_order")
        .in("product_id", ids)
        .order("sort_order"),
      supabase.from("categories").select("id, name"),
      supabase
        .from("product_shades")
        .select("product_id, color_hex")
        .in("product_id", ids)
        .not("color_hex", "is", null),
    ]);

    const coverByProduct = new Map<string, string>();
    const firstByProduct = new Map<string, string>();
    for (const img of imagesRes.data ?? []) {
      const key = img.product_id;
      if (img.is_cover && !coverByProduct.has(key)) coverByProduct.set(key, img.image_url);
      if (!firstByProduct.has(key)) firstByProduct.set(key, img.image_url);
    }
    const categoryNameById = new Map(
      (categoriesRes.data ?? []).map((item: { id: string; name: string }) => [item.id, item.name]),
    );
    const shadesByProduct = new Map<string, string[]>();
    for (const shade of shadesRes.data ?? []) {
      if (!shade.color_hex) continue;
      const colors = shadesByProduct.get(shade.product_id) ?? [];
      colors.push(shade.color_hex);
      shadesByProduct.set(shade.product_id, colors);
    }

    return (data as Array<{ id: string; slug: string; name: string; in_stock: boolean; category_id: string; price: number | null; discount_price: number | null }>).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      in_stock: r.in_stock,
      category_name: categoryNameById.get(r.category_id) ?? "",
      cover_url: coverByProduct.get(r.id) ?? firstByProduct.get(r.id) ?? null,
      shade_colors: shadesByProduct.get(r.id) ?? [],
      price: r.price ?? null,
      discount_price: r.discount_price ?? null,
    }));
  } catch {
    log.warn("getBestSellers failed, falling back");
    const cards = await searchProductCards({ q: null, category: null, page: 1 });
    return cards.slice(0, limit);
  }
}

export async function getKoreanProducts(limit = 8): Promise<ProductCardRow[]> {
  try {
    const supabase = supabasePublic();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, in_stock, category_id, price, discount_price, is_korean",
      )
      .eq("is_visible", true)
      .eq("is_korean", true)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) return [];

    const ids = data.map((r: { id: string }) => r.id);
    const [imagesRes, categoriesRes, shadesRes] = await Promise.all([
      supabase
        .from("product_images")
        .select("product_id, image_url, is_cover, sort_order")
        .in("product_id", ids)
        .order("sort_order"),
      supabase.from("categories").select("id, name"),
      supabase
        .from("product_shades")
        .select("product_id, color_hex")
        .in("product_id", ids)
        .not("color_hex", "is", null),
    ]);

    const coverByProduct = new Map<string, string>();
    const firstByProduct = new Map<string, string>();
    for (const img of imagesRes.data ?? []) {
      const key = img.product_id;
      if (img.is_cover && !coverByProduct.has(key)) coverByProduct.set(key, img.image_url);
      if (!firstByProduct.has(key)) firstByProduct.set(key, img.image_url);
    }
    const categoryNameById = new Map(
      (categoriesRes.data ?? []).map((item: { id: string; name: string }) => [item.id, item.name]),
    );
    const shadesByProduct = new Map<string, string[]>();
    for (const shade of shadesRes.data ?? []) {
      if (!shade.color_hex) continue;
      const colors = shadesByProduct.get(shade.product_id) ?? [];
      colors.push(shade.color_hex);
      shadesByProduct.set(shade.product_id, colors);
    }

    return (data as Array<{ id: string; slug: string; name: string; in_stock: boolean; category_id: string; price: number | null; discount_price: number | null }>).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      in_stock: r.in_stock,
      category_name: categoryNameById.get(r.category_id) ?? "",
      cover_url: coverByProduct.get(r.id) ?? firstByProduct.get(r.id) ?? null,
      shade_colors: shadesByProduct.get(r.id) ?? [],
      price: r.price ?? null,
      discount_price: r.discount_price ?? null,
    }));
  } catch {
    log.warn("getKoreanProducts failed");
    return [];
  }
}

export async function getLatestDrop(limit = 8): Promise<ProductCardRow[]> {
  const cards = await searchProductCards({ q: null, category: null, page: 1 });
  return cards.slice(0, limit);
}

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  discount_price: number | null;
  in_stock: boolean;
  category_name: string;
  category_slug: string;
  images: Array<{ id: string; url: string }>;
  shades: Array<{
    id: string;
    code: string | null;
    name: string;
    color_hex: string | null;
    is_available: boolean;
    image_id: string | null;
    image_url: string | null;
  }>;
};

async function loadProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  try {
    const supabase = supabasePublic();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, description, price, discount_price, in_stock, category_id, categories(name, slug)",
      )
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();
    if (error || !data) return null;

    const product = data as unknown as {
      id: string;
      slug: string;
      name: string;
      description: string | null;
      price: number | null;
      discount_price: number | null;
      in_stock: boolean;
      categories: { name: string; slug: string } | null;
    };

    const [imagesRes, shadesRes] = await Promise.all([
      supabase
        .from("product_images")
        .select("id, image_url, sort_order, is_cover")
        .eq("product_id", product.id)
        .order("sort_order"),
      supabase
        .from("product_shades")
        .select("id, code, name, color_hex, is_available, image_id, sort_order")
        .eq("product_id", product.id)
        .order("sort_order"),
    ]);
    const imagesData = imagesRes.data ?? [];
    const shadesData = shadesRes.data ?? [];

    const imageUrlById = new Map(
      imagesData.map((image) => [image.id, image.image_url]),
    );
    const shadeImageIds = new Set(
      shadesData
        .map((shade) => shade.image_id)
        .filter((imageId): imageId is string => imageId !== null),
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price ?? null,
      discount_price: product.discount_price ?? null,
      in_stock: Boolean(product.in_stock),
      category_name: product.categories?.name ?? "",
      category_slug: product.categories?.slug ?? "",
      images: imagesData
        .filter((image) => image.is_cover || !shadeImageIds.has(image.id))
        .sort((a, b) => Number(b.is_cover) - Number(a.is_cover))
        .map((img) => ({
          id: img.id,
          url: img.image_url,
        })),
      shades: shadesData.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        color_hex: s.color_hex,
        is_available: s.is_available,
        image_id: s.image_id,
        image_url: s.image_id ? imageUrlById.get(s.image_id) ?? null : null,
      })),
    };
  } catch (err) {
    log.warn("public product detail query caught exception", { err });
    return null;
  }
}

const cachedProductBySlug = unstable_cache(
  async (slug: string) => loadProductBySlug(slug),
  ["public-product-detail"],
  { revalidate: 1800, tags: [PUBLIC_CATALOG_TAG] },
);

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  return cachedProductBySlug(slug);
}
