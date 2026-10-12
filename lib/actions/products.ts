"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { log } from "@/lib/log";
import { limitAction } from "@/lib/ratelimit";
import { slugify } from "@/lib/slug";
import { isAdmin, supabaseServer } from "@/lib/supabase/server";

const STORAGE_PREFIX = "/storage/v1/object/public/product-images/";

const shadeSchema = z.object({
  code: z.string().trim().max(20).nullish(),
  name: z.string().trim().min(1).max(60),
  color_hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  is_available: z.boolean(),
  image_id: z.string().uuid().nullish(),
});

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  category_id: z.string().uuid(),
  description: z.string().max(2000).nullish(),
  price: z.coerce.number().min(0).max(999999.99),
  discount_price: z.coerce.number().min(0).max(999999.99).nullish(),
  is_visible: z.boolean(),
  in_stock: z.boolean(),
  slug_locked_existing: z.boolean().optional(),
});

const imageRowSchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => u.includes(STORAGE_PREFIX)),
  path: z.string().min(1).max(300).refine((p) => !p.includes("..")),
  is_cover: z.boolean(),
});

export type ProductFormState = { error?: string; slug?: string };

export type ShadeInput = z.input<typeof shadeSchema>;
export type ImageInput = z.input<typeof imageRowSchema>;

async function revalidateProduct(slug: string, oldSlug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/product/${oldSlug}`);
}

async function sameOriginCheck(): Promise<boolean> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const siteUrl = process.env.SITE_URL;
  if (origin && siteUrl) {
    return new URL(origin).host === new URL(siteUrl).host;
  }
  return true;
}

async function imageBelongsToProduct(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  productId: string,
  imageId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("product_images")
    .select("id")
    .eq("id", imageId)
    .eq("product_id", productId)
    .maybeSingle();
  return data !== null;
}

export async function saveProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!(await sameOriginCheck())) {
    return { error: "Something went wrong. Please try again." };
  }
  const limit = await limitAction("products");
  if (!limit.allowed) {
    return { error: "Too many requests. Try again in a minute." };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  const parsed = productSchema.safeParse(payload);
  if (!parsed.success) {
    const flat = parsed.error.issues[0]?.path?.join(".");
    return {
      error:
        flat === "discount_price"
          ? "Discounted price must be lower than the original price."
          : "Check the highlighted fields and try again.",
    };
  }
  const data = parsed.data;

  const imagesParsed = z.array(imageRowSchema).max(12).safeParse(
    (() => {
      try {
        return JSON.parse(String(formData.get("images") ?? "[]"));
      } catch {
        return [];
      }
    })(),
  );
  if (!imagesParsed.success) {
    return { error: "One of the photos is not valid." };
  }

  const shadesParsed = z.array(shadeSchema).max(300).safeParse(
    (() => {
      try {
        return JSON.parse(String(formData.get("shades") ?? "[]"));
      } catch {
        return [];
      }
    })(),
  );
  if (!shadesParsed.success) {
    return { error: "Check the shade details and try again." };
  }

  const supabase = await supabaseServer();

  const { data: productRow } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", data.id)
    .maybeSingle();
  const isUpdate = productRow !== null;

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", data.category_id)
    .maybeSingle();
  if (!category) {
    return { error: "Choose a category to continue." };
  }

  if (
    data.discount_price !== undefined &&
    data.discount_price !== null &&
    data.discount_price >= data.price
  ) {
    return { error: "Discounted price must be lower than the original price." };
  }

  const slugBase = slugify(data.name);
  let slug = isUpdate && productRow !== null ? productRow.slug : slugBase;
  if (!isUpdate) {
    const { data: slugTaken } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (slugTaken) {
      slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;
    }
  }

  const productValues = {
    name: data.name,
    category_id: data.category_id,
    description: data.description ?? null,
    price: data.price,
    discount_price: data.discount_price ?? null,
    is_visible: data.is_visible,
    in_stock: data.in_stock,
  };

  const { error: productError } = isUpdate
    ? await supabase.from("products").update(productValues).eq("id", data.id)
    : await supabase
        .from("products")
        .insert({ ...productValues, slug, id: data.id });

  if (productError) {
    log.error("product save failed", productError);
    return { error: "Something went wrong. Please try again." };
  }

  const images = imagesParsed.data.map((img, i) => ({
    product_id: data.id,
    image_url: img.url,
    storage_path: img.path,
    sort_order: i,
    is_cover: i === 0,
  }));

  const { error: imagesError } = isUpdate
    ? await supabase.from("product_images").delete().eq("product_id", data.id)
    : { error: null };
  if (imagesError) {
    log.error("image replace failed", imagesError);
  }
  if (images.length > 0) {
    const { error } = await supabase.from("product_images").insert(images);
    if (error) {
      log.error("image insert failed", error);
      return { error: "Something went wrong. Please try again." };
    }
  }

  const shades = shadesParsed.data.map((sh, i) => ({
    product_id: data.id,
    code: sh.code ?? null,
    name: sh.name,
    color_hex: sh.color_hex ?? null,
    is_available: sh.is_available,
    image_id: null,
    sort_order: i,
  }));

  const { error: shadesError } = isUpdate
    ? await supabase.from("product_shades").delete().eq("product_id", data.id)
    : { error: null };
  if (shadesError) {
    log.error("shade replace failed", shadesError);
  }
  if (shades.length > 0) {
    const { error } = await supabase.from("product_shades").insert(shades);
    if (error) {
      log.error("shade insert failed", error);
      return { error: "Something went wrong. Please try again." };
    }
  }

  await revalidateProduct(slug, isUpdate ? productRow?.slug : undefined);

  return { slug: `/admin/products` };
}

export async function deleteProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!(await sameOriginCheck())) {
    return { error: "Something went wrong. Please try again." };
  }
  const limit = await limitAction("products");
  if (!limit.allowed) {
    return { error: "Too many requests. Try again in a minute." };
  }

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Something went wrong. Please try again." };
  }

  const supabase = await supabaseServer();
  const { data: row } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id.data)
    .maybeSingle();
  const slug = row?.slug;

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id.data);
  const paths = (images ?? []).map((i) => i.storage_path).filter(Boolean);
  if (paths.length > 0) {
    const { error: rmError } = await supabase.storage
      .from("product-images")
      .remove(paths);
    if (rmError) log.warn("storage remove failed", rmError);
  }

  const { error } = await supabase.from("products").delete().eq("id", id.data);
  if (error) {
    log.error("product delete failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  if (slug) {
    revalidatePath("/");
    revalidatePath(`/product/${slug}`);
  }
  revalidatePath("/admin/products");
  return { slug: "/admin/products" };
}

export async function duplicateProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!(await sameOriginCheck())) {
    return { error: "Something went wrong. Please try again." };
  }
  const limit = await limitAction("products");
  if (!limit.allowed) {
    return { error: "Too many requests. Try again in a minute." };
  }

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Something went wrong. Please try again." };
  }

  const supabase = await supabaseServer();
  const { data: original } = await supabase
    .from("products")
    .select(
      "name, category_id, description, price, discount_price, is_visible, in_stock, product_images(image_url, storage_path), product_shades(code, name, color_hex)",
    )
    .eq("id", id.data)
    .maybeSingle();
  if (!original) {
    return { error: "Something went wrong. Please try again." };
  }

  let slug = slugify(`${original.name} copy`);
  const { data: slugTaken } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugTaken) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const newId = crypto.randomUUID();
  const { error } = await supabase.from("products").insert({
    id: newId,
    name: `${original.name} (copy)`,
    category_id: original.category_id,
    description: original.description,
    price: original.price,
    discount_price: original.discount_price,
    is_visible: false,
    in_stock: original.in_stock,
    slug,
  });
  if (error) {
    log.error("duplicate failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  const images = (original.product_images ?? []).map((img, i) => ({
    product_id: newId,
    image_url: img.image_url,
    storage_path: img.storage_path,
    sort_order: i,
    is_cover: i === 0,
  }));
  if (images.length > 0) {
    await supabase.from("product_images").insert(images);
  }

  const shades = (original.product_shades ?? []).map((sh, i) => ({
    product_id: newId,
    code: sh.code,
    name: sh.name,
    color_hex: sh.color_hex,
    is_available: true,
    sort_order: i,
  }));
  if (shades.length > 0) {
    await supabase.from("product_shades").insert(shades);
  }

  revalidatePath("/admin/products");
  return { slug: `/admin/products/${newId}` };
}

export async function moveCategoryAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  const productId = z.string().uuid().safeParse(formData.get("id"));
  const categoryId = z.string().uuid().safeParse(formData.get("category_id"));
  if (!productId.success || !categoryId.success) {
    return { error: "Something went wrong. Please try again." };
  }
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("products")
    .update({ category_id: categoryId.data })
    .eq("id", productId.data);
  if (error) {
    log.error("move category failed", error);
    return { error: "Something went wrong. Please try again." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { slug: "/admin/products" };
}

export async function deleteImageAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  if (!(await isAdmin())) redirect("/admin/login");
  const productId = z.string().uuid().safeParse(formData.get("product_id"));
  const imageId = z.string().uuid().safeParse(formData.get("image_id"));
  if (!productId.success || !imageId.success) {
    return { error: "Something went wrong. Please try again." };
  }
  const supabase = await supabaseServer();
  const belongs = await imageBelongsToProduct(supabase, productId.data, imageId.data);
  if (!belongs) {
    return { error: "Something went wrong. Please try again." };
  }
  const { data: img } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId.data)
    .maybeSingle();
  if (img?.storage_path) {
    const { error } = await supabase.storage
      .from("product-images")
      .remove([img.storage_path]);
    if (error) log.warn("storage remove failed", error);
  }
  await supabase.from("product_images").delete().eq("id", imageId.data);
  revalidatePath("/admin/products");
  return { slug: "/admin/products" };
}
