import "server-only";

import { supabaseServer } from "@/lib/supabase/server";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  product_count: number;
  parent_id?: string | null;
};

export async function listCategoriesAdmin(): Promise<AdminCategory[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order, products(count)")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      sort_order: number;
      parent_id?: string | null;
      products: { count: number }[] | null;
    };
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      image_url: r.image_url,
      sort_order: r.sort_order,
      parent_id: r.parent_id ?? null,
      product_count: r.products?.[0]?.count ?? 0,
    };
  });
}

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  is_visible: boolean;
  in_stock: boolean;
  category_name: string;
  cover_url: string | null;
};

export async function listProductsAdmin(filters?: {
  q?: string;
  category?: string;
}): Promise<AdminProductRow[]> {
  const supabase = await supabaseServer();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, is_visible, in_stock, categories(name), product_images(image_url, is_cover, sort_order)",
    )
    .order("created_at", { ascending: false });

  const q = filters?.q?.trim();
  if (q) {
    query = query.ilike("name", `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  }
  if (filters?.category) {
    query = query.eq("category_id", filters.category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      name: string;
      slug: string;
      is_visible: boolean;
      in_stock: boolean;
      categories: { name: string } | null;
      product_images:
        | { image_url: string; is_cover: boolean; sort_order: number }[]
        | null;
    };
    const images = r.product_images ?? [];
    const cover = images.find((i) => i.is_cover) ?? images[0];
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      is_visible: r.is_visible,
      in_stock: r.in_stock,
      category_name: r.categories?.name ?? "",
      cover_url: cover?.image_url ?? null,
    };
  });
}

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  discount_price: number | null;
  is_visible: boolean;
  in_stock: boolean;
  category_id: string;
  images: Array<{ id: string; url: string; storage_path: string; is_cover: boolean }>;
  shades: Array<{
    id: string;
    code: string | null;
    name: string;
    color_hex: string | null;
    is_available: boolean;
    image_id: string | null;
    image: { url: string; path: string } | null;
  }>;
};

export async function getProductAdmin(
  id: string,
): Promise<AdminProduct | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, discount_price, is_visible, in_stock, category_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const product = data as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number | null;
    discount_price: number | null;
    is_visible: boolean;
    in_stock: boolean;
    category_id: string;
  };

  const [imagesRes, shadesRes] = await Promise.all([
    supabase
      .from("product_images")
      .select("id, image_url, storage_path, is_cover, sort_order")
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
  const imageById = new Map(
    (imagesRes.data ?? []).map((image) => [
      image.id,
      { url: image.image_url, path: image.storage_path },
    ]),
  );
  const shadeImageIds = new Set(
    (shadesRes.data ?? [])
      .map((shade) => shade.image_id)
      .filter((imageId): imageId is string => imageId !== null),
  );

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price ?? null,
    discount_price: product.discount_price ?? null,
    is_visible: product.is_visible,
    in_stock: product.in_stock,
    category_id: product.category_id,
    images: (imagesRes.data ?? [])
      .filter((image) => !shadeImageIds.has(image.id))
      .map((i) => ({
      id: i.id,
      url: i.image_url,
      storage_path: i.storage_path,
      is_cover: i.is_cover,
      })),
    shades: (shadesRes.data ?? []).map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      color_hex: s.color_hex,
      is_available: s.is_available,
      image_id: s.image_id,
      image: s.image_id ? imageById.get(s.image_id) ?? null : null,
    })),
  };
}
