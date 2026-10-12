import "server-only";

import { supabasePublic } from "@/lib/supabase/server";

export const PAGE_SIZE = 24;

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
  price: number;
  discount_price: number | null;
  in_stock: boolean;
  category_name: string;
  cover_url: string | null;
};

export async function listCategories(): Promise<CategoryRow[]> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryRow[];
}

type SearchArgs = {
  q: string | null;
  category: string | null;
  page: number;
};

export async function searchProductCards({
  q,
  category,
  page,
}: SearchArgs): Promise<ProductCardRow[]> {
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
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{
    id: string;
    slug: string;
    name: string;
    price: number | string;
    discount_price: number | string | null;
    in_stock: boolean;
  }>;

  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const { data: images, error: imgError } = await supabase
    .from("product_images")
    .select("product_id, image_url, is_cover, sort_order")
    .in("product_id", ids);
  if (imgError) throw new Error(imgError.message);

  const coverByProduct = new Map<string, string>();
  const firstByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    const key = img.product_id;
    if (img.is_cover && !coverByProduct.has(key)) {
      coverByProduct.set(key, img.image_url);
    }
    if (!firstByProduct.has(key)) {
      firstByProduct.set(key, img.image_url);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    price: Number(r.price),
    discount_price:
      r.discount_price === null ? null : Number(r.discount_price),
    in_stock: r.in_stock,
    category_name: "",
    cover_url:
      coverByProduct.get(r.id) ?? firstByProduct.get(r.id) ?? null,
  }));
}

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
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
  }>;
};

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = supabasePublic();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price, discount_price, in_stock, category_id, categories(name, slug)",
    )
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const product = data as unknown as {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    price: number | string;
    discount_price: number | string | null;
    in_stock: boolean;
    categories: { name: string; slug: string } | null;
  };

  const [imagesRes, shadesRes] = await Promise.all([
    supabase
      .from("product_images")
      .select("id, image_url, sort_order")
      .eq("product_id", product.id)
      .order("sort_order"),
    supabase
      .from("product_shades")
      .select("id, code, name, color_hex, is_available, image_id, sort_order")
      .eq("product_id", product.id)
      .order("sort_order"),
  ]);
  if (imagesRes.error) throw new Error(imagesRes.error.message);
  if (shadesRes.error) throw new Error(shadesRes.error.message);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    discount_price:
      product.discount_price === null ? null : Number(product.discount_price),
    in_stock: product.in_stock,
    category_name: product.categories?.name ?? "",
    category_slug: product.categories?.slug ?? "",
    images: (imagesRes.data ?? []).map((img) => ({
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
    })),
  };
}
