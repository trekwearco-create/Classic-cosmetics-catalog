"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { log } from "@/lib/log";
import { limitAction } from "@/lib/ratelimit";
import { isSameOriginRequest } from "@/lib/request-security";
import { slugify } from "@/lib/slug";
import { isAdmin, supabaseServer } from "@/lib/supabase/server";

const STORAGE_PREFIX = "/storage/v1/object/public/product-images/";

const imageRowSchema = z.object({
  url: z.string().url(),
  path: z.string().min(1).max(300).refine((p) => !p.includes("..")),
  is_cover: z.boolean(),
});

const shadeSchema = z.object({
  code: z.string().trim().max(20).nullish(),
  name: z.string().trim().min(1).max(60),
  color_hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullish(),
  is_available: z.boolean(),
  image: imageRowSchema.nullish(),
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

export type ProductFormState = { error?: string; slug?: string };

export type ShadeInput = z.input<typeof shadeSchema>;
export type ImageInput = z.input<typeof imageRowSchema>;

async function revalidateProduct(slug: string, oldSlug?: string) {
  updateTag("public-catalog");
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
  if (oldSlug && oldSlug !== slug) revalidatePath(`/product/${oldSlug}`);
}

function imageBelongsToPath(image: ImageInput, productId: string): boolean {
  try {
    const url = new URL(image.url);
    const base = new URL(process.env.SUPABASE_URL ?? "");
    const path = decodeURIComponent(
      url.pathname.slice(STORAGE_PREFIX.length),
    );
    return (
      url.origin === base.origin &&
      url.pathname.startsWith(STORAGE_PREFIX) &&
      url.search === "" &&
      path === image.path &&
      image.path.startsWith(`products/${productId}/`)
    );
  } catch {
    return false;
  }
}

async function sameOriginCheck(): Promise<boolean> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  return !origin || isSameOriginRequest(headerList);
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

  let imagePayload: unknown;
  let shadePayload: unknown;
  try {
    imagePayload = JSON.parse(String(formData.get("images") ?? "[]"));
    shadePayload = JSON.parse(String(formData.get("shades") ?? "[]"));
  } catch {
    return { error: "Check the product photos and shades, then try again." };
  }
  const imagesParsed = z.array(imageRowSchema).max(12).safeParse(imagePayload);
  if (!imagesParsed.success) {
    return { error: "One of the photos is not valid." };
  }

  const shadesParsed = z.array(shadeSchema).max(300).safeParse(shadePayload);
  if (!shadesParsed.success) {
    return { error: "Check the shade details and try again." };
  }
  const requestedImages = [
    ...imagesParsed.data,
    ...shadesParsed.data.flatMap((shade) =>
      shade.image ? [shade.image] : [],
    ),
  ];
  if (requestedImages.some((image) => !imageBelongsToPath(image, data.id))) {
    return { error: "One of the product photos is not valid." };
  }

  const supabase = await supabaseServer();

  const { data: productRow, error: productLookupError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", data.id)
    .maybeSingle();
  if (productLookupError) {
    log.error("product lookup failed", { code: productLookupError.code });
    return { error: "Something went wrong. Please try again." };
  }
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
    log.error("product save failed", { code: productError.code });
    return { error: "Something went wrong. Please try again." };
  }

  const { data: currentImages, error: currentImagesError } = await supabase
    .from("product_images")
    .select("id, image_url, storage_path")
    .eq("product_id", data.id);
  if (currentImagesError) {
    log.error("product images lookup failed", { code: currentImagesError.code });
    return { error: "Something went wrong. Please try again." };
  }
  const currentByPath = new Map(
    (currentImages ?? []).map((image) => [image.storage_path, image]),
  );
  const desiredByPath = new Map<string, ImageInput>();
  imagesParsed.data.forEach((image) => desiredByPath.set(image.path, image));
  shadesParsed.data.forEach((shade) => {
    if (shade.image) desiredByPath.set(shade.image.path, shade.image);
  });
  const imageIdByPath = new Map(
    (currentImages ?? []).map((image) => [image.storage_path, image.id]),
  );

  const newImages = [...desiredByPath.values()]
    .filter((image) => !currentByPath.has(image.path))
    .map((image, index) => ({
      product_id: data.id,
      image_url: image.url,
      storage_path: image.path,
      sort_order: imagesParsed.data.findIndex((gallery) => gallery.path === image.path) >= 0
        ? imagesParsed.data.findIndex((gallery) => gallery.path === image.path)
        : imagesParsed.data.length + index,
      is_cover: false,
    }));
  if (newImages.length > 0) {
    const { data: inserted, error } = await supabase
      .from("product_images")
      .insert(newImages)
      .select("id, storage_path");
    if (error) {
      log.error("product image insert failed", { code: error.code });
      return { error: "Something went wrong. Please try again." };
    }
    inserted?.forEach((image) => imageIdByPath.set(image.storage_path, image.id));
  }

  for (const [path, image] of desiredByPath) {
    const id = imageIdByPath.get(image.path);
    if (!id) {
      log.error("product image mapping failed");
      return { error: "Something went wrong. Please try again." };
    }
    const galleryIndex = imagesParsed.data.findIndex(
      (gallery) => gallery.path === path,
    );
    const { error } = await supabase
      .from("product_images")
      .update({
        image_url: image.url,
        sort_order: galleryIndex >= 0 ? galleryIndex : imagesParsed.data.length,
        is_cover: galleryIndex === 0,
      })
      .eq("id", id);
    if (error) {
      log.error("product image update failed", { code: error.code });
      return { error: "Something went wrong. Please try again." };
    }
  }

  const shades = shadesParsed.data.map((sh, i) => ({
    product_id: data.id,
    code: sh.code ?? null,
    name: sh.name,
    color_hex: sh.color_hex ?? null,
    is_available: sh.is_available,
    image_id: sh.image ? imageIdByPath.get(sh.image.path) ?? null : null,
    sort_order: i,
  }));

  const { error: shadesError } = await supabase
    .from("product_shades")
    .delete()
    .eq("product_id", data.id);
  if (shadesError) {
    log.error("shade replace failed", { code: shadesError.code });
    return { error: "Something went wrong. Please try again." };
  }
  if (shades.length > 0) {
    const { error } = await supabase.from("product_shades").insert(shades);
    if (error) {
      log.error("shade insert failed", { code: error.code });
      return { error: "Something went wrong. Please try again." };
    }
  }

  const desiredPaths = new Set(desiredByPath.keys());
  const removedImages = (currentImages ?? []).filter(
    (image) => !desiredPaths.has(image.storage_path),
  );
  if (removedImages.length > 0) {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .in(
        "id",
        removedImages.map((image) => image.id),
      );
    if (error) {
      log.error("unused product image cleanup failed", { code: error.code });
      return { error: "Product saved, but an unused photo could not be removed." };
    }
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove(removedImages.map((image) => image.storage_path));
    if (storageError) {
      log.warn("unused product storage cleanup failed", { code: storageError.name });
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
  if (!slug) {
    return { error: "This product no longer exists." };
  }

  const { data: images, error: imageLookupError } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id.data);
  if (imageLookupError) {
    log.error("product delete image lookup failed", { code: imageLookupError.code });
    return { error: "Something went wrong. Please try again." };
  }

  const { error } = await supabase.from("products").delete().eq("id", id.data);
  if (error) {
    log.error("product delete failed", { code: error.code });
    return { error: "Something went wrong. Please try again." };
  }

  const paths = (images ?? []).map((image) => image.storage_path);
  if (paths.length > 0) {
    const { error: rmError } = await supabase.storage
      .from("product-images")
      .remove(paths);
    if (rmError) log.warn("product storage cleanup failed", { code: rmError.name });
  }
  updateTag("public-catalog");
  revalidatePath("/");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
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
      "name, category_id, description, price, discount_price, is_visible, in_stock, product_images(id, image_url, storage_path, is_cover, sort_order), product_shades(code, name, color_hex, is_available, sort_order, image_id)",
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
    log.error("product duplicate failed", { code: error.code });
    return { error: "Something went wrong. Please try again." };
  }

  const sourceImages = original.product_images ?? [];
  const copiedPaths: string[] = [];
  const imageIdByOriginalId = new Map<string, string>();
  const originalIdByNewPath = new Map<string, string>();
  const images = [];
  const supabaseUrl = process.env.SUPABASE_URL;
  for (const [i, img] of sourceImages.entries()) {
    const fileName = img.storage_path.split("/").pop();
    if (!fileName || !supabaseUrl) {
      log.error("product duplicate image path invalid");
      await supabase.from("products").delete().eq("id", newId);
      return { error: "A product photo could not be copied." };
    }
    const path = `products/${newId}/${img.storage_path.includes("/shades/") ? "shades/" : ""}${fileName}`;
    const { error: copyError } = await supabase.storage
      .from("product-images")
      .copy(img.storage_path, path);
    if (copyError) {
      log.error("product duplicate image copy failed", { code: copyError.name });
      if (copiedPaths.length > 0) {
        await supabase.storage.from("product-images").remove(copiedPaths);
      }
      await supabase.from("products").delete().eq("id", newId);
      return { error: "A product photo could not be copied." };
    }
    copiedPaths.push(path);
    originalIdByNewPath.set(path, img.id);
    images.push({
      product_id: newId,
      image_url: `${supabaseUrl}${STORAGE_PREFIX}${path}`,
      storage_path: path,
      sort_order: img.sort_order ?? i,
      is_cover: img.is_cover,
    });
  }
  if (images.length > 0) {
    const { data: inserted, error: imageInsertError } = await supabase
      .from("product_images")
      .insert(images)
      .select("id, storage_path");
    if (imageInsertError) {
      log.error("product duplicate image insert failed", { code: imageInsertError.code });
      await supabase.storage.from("product-images").remove(copiedPaths);
      await supabase.from("products").delete().eq("id", newId);
      return { error: "Product could not be duplicated." };
    }
    for (const created of inserted ?? []) {
      const originalId = originalIdByNewPath.get(created.storage_path);
      if (originalId) imageIdByOriginalId.set(originalId, created.id);
    }
  }

  const shades = (original.product_shades ?? []).map((sh, i) => ({
    product_id: newId,
    code: sh.code,
    name: sh.name,
    color_hex: sh.color_hex,
    is_available: sh.is_available,
    sort_order: i,
    image_id: sh.image_id ? imageIdByOriginalId.get(sh.image_id) ?? null : null,
  }));
  if (shades.length > 0) {
    const { error: shadeInsertError } = await supabase
      .from("product_shades")
      .insert(shades);
    if (shadeInsertError) {
      log.error("product duplicate shade insert failed", { code: shadeInsertError.code });
      await supabase.storage.from("product-images").remove(copiedPaths);
      await supabase.from("products").delete().eq("id", newId);
      return { error: "Product could not be duplicated." };
    }
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
    log.error("product category move failed", { code: error.code });
    return { error: "Something went wrong. Please try again." };
  }
  updateTag("public-catalog");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
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
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId.data)
    .maybeSingle();
  if (!product) {
    return { error: "This product no longer exists." };
  }
  const belongs = await imageBelongsToProduct(supabase, productId.data, imageId.data);
  if (!belongs) {
    return { error: "Something went wrong. Please try again." };
  }
  const { data: img } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId.data)
    .maybeSingle();
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId.data);
  if (deleteError) {
    log.error("product image delete failed", { code: deleteError.code });
    return { error: "Something went wrong. Please try again." };
  }
  if (img?.storage_path) {
    const { error } = await supabase.storage
      .from("product-images")
      .remove([img.storage_path]);
    if (error) log.warn("product image cleanup failed", { code: error.name });
  }
  updateTag("public-catalog");
  revalidatePath("/");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/admin/products");
  return { slug: "/admin/products" };
}
