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
};

export type ProductCardRow = {
  id: string;
  slug: string;
  name: string;
  in_stock: boolean;
  category_name: string;
  cover_url: string | null;
  shade_colors: string[];
};

async function loadCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = supabasePublic();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, sort_order")
      .order("sort_order")
      .order("name");
    if (error) {
      log.warn("public categories query failed", { code: error.code });
      return [];
    }
    return (data ?? []) as CategoryRow[];
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

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
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
        "id, slug, name, description, in_stock, category_id, categories(name, slug)",
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
    if (imagesRes.error || shadesRes.error) {
      log.warn("public product detail query failed", {
        code: imagesRes.error?.code ?? shadesRes.error?.code,
      });
      return null;
    }

    const imageUrlById = new Map(
      (imagesRes.data ?? []).map((image) => [image.id, image.image_url]),
    );
    const shadeImageIds = new Set(
      (shadesRes.data ?? [])
        .map((shade) => shade.image_id)
        .filter((imageId): imageId is string => imageId !== null),
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      in_stock: product.in_stock,
      category_name: product.categories?.name ?? "",
      category_slug: product.categories?.slug ?? "",
      images: (imagesRes.data ?? [])
        .filter((image) => image.is_cover || !shadeImageIds.has(image.id))
        .sort((a, b) => Number(b.is_cover) - Number(a.is_cover))
        .map((img) => ({
          id: img.id,
          url: img.image_url,
        })),
      shades: (shadesRes.data ?? []).map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        color_hex: s.color_hex,
        is_available: s.is_available,
        image_id: s.image_id,
        image_url: s.image_id ? imageUrlById.get(s.image_id) ?? null : null,
      })),
    };
  } catch {
    log.warn("public product detail query failed");
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
