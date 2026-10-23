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
  show_in_menu?: boolean;
  show_in_homepage?: boolean;
  is_active?: boolean;
  description?: string | null;
  children_count?: number;
  full_path?: string;
};

export type AdminHomeSection = {
  key: string;
  title: string;
  type: string;
  bg_color: string | null;
  is_visible: boolean;
  sort_order: number;
  banner_count?: number;
};

export type AdminBanner = {
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
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export async function listCategoriesAdmin(): Promise<AdminCategory[]> {
  const supabase = await supabaseServer();
  
  // Try with full schema first (including show_in_homepage)
  let rows: Array<{
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
    products: { count: number }[] | null;
  }> = [];

  const fullRes = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order, parent_id, show_in_menu, show_in_homepage, is_active, description, products(count)")
    .order("sort_order")
    .order("name");

  if (!fullRes.error && fullRes.data) {
    rows = fullRes.data as unknown as typeof rows;
  } else {
    // Fallback if show_in_homepage or other columns not in DB yet
    const fallbackRes = await supabase
      .from("categories")
      .select("id, name, slug, image_url, sort_order, products(count)")
      .order("sort_order")
      .order("name");
    if (fallbackRes.error) throw new Error(fallbackRes.error.message);
    rows = (fallbackRes.data ?? []).map((r) => ({
      ...r,
      parent_id: null,
      show_in_menu: true,
      show_in_homepage: false,
      is_active: true,
      description: null,
    })) as unknown as typeof rows;
  }

  // Count children per parent
  const childrenCountByParent = new Map<string, number>();
  for (const r of rows) {
    if (r.parent_id) {
      childrenCountByParent.set(
        r.parent_id,
        (childrenCountByParent.get(r.parent_id) ?? 0) + 1,
      );
    }
  }

  // Build name by id for full path
  const nameById = new Map<string, { name: string; parent_id?: string | null }>();
  for (const r of rows) {
    nameById.set(r.id, { name: r.name, parent_id: r.parent_id });
  }

  const getFullPath = (id: string): string => {
    const item = nameById.get(id);
    if (!item) return "";
    if (item.parent_id && nameById.has(item.parent_id)) {
      return `${getFullPath(item.parent_id)} > ${item.name}`;
    }
    return item.name;
  };

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    image_url: r.image_url,
    sort_order: r.sort_order,
    parent_id: r.parent_id ?? null,
    show_in_menu: r.show_in_menu !== false,
    show_in_homepage: r.show_in_homepage === true,
    is_active: r.is_active !== false,
    description: r.description ?? null,
    product_count: r.products?.[0]?.count ?? 0,
    children_count: childrenCountByParent.get(r.id) ?? 0,
    full_path: getFullPath(r.id),
  }));
}

export async function listHomeSectionsAdmin(): Promise<AdminHomeSection[]> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("home_sections")
    .select("key, title, type, bg_color, is_visible, sort_order, banners(count)")
    .order("sort_order");
  if (error) return [];
  return (data ?? []).map((row) => {
    const r = row as unknown as {
      key: string;
      title: string;
      type: string;
      bg_color: string | null;
      is_visible: boolean;
      sort_order: number;
      banners: { count: number }[] | null;
    };
    return {
      key: r.key,
      title: r.title,
      type: r.type,
      bg_color: r.bg_color,
      is_visible: r.is_visible,
      sort_order: r.sort_order,
      banner_count: r.banners?.[0]?.count ?? 0,
    };
  });
}

export async function listBannersAdmin(sectionKey?: string): Promise<AdminBanner[]> {
  const supabase = await supabaseServer();
  let query = supabase
    .from("banners")
    .select("id, section_key, image_url_mobile, image_url_desktop, link_url, title, alt, extra_text, sort_order, is_active, starts_at, ends_at, created_at")
    .order("sort_order");
  if (sectionKey) {
    query = query.eq("section_key", sectionKey);
  }
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as AdminBanner[];
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
