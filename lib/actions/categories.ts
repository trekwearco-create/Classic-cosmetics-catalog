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

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  sort_order: z.coerce.number().int().min(0).max(9999),
  image_url: z.string().url().max(500).refine(isPublicImageUrl).nullish(),
  parent_id: z.string().uuid().nullish(),
});

export type CategoryFormState = {
  error?: string;
  success?: string;
};

export type CategoryInput = z.input<typeof categorySchema>;

async function requireAdmin(): Promise<boolean> {
  return isAdmin();
}

function safeSlug(name: string): string {
  return slugify(name);
}

function isPublicImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const base = new URL(process.env.SUPABASE_URL ?? "");
    return (
      url.origin === base.origin &&
      url.pathname.startsWith("/storage/v1/object/public/product-images/") &&
      url.search === ""
    );
  } catch {
    return false;
  }
}

function storagePathFromPublicUrl(value: string | null | undefined): string | null {
  if (!value || !isPublicImageUrl(value)) return null;
  try {
    return decodeURIComponent(
      new URL(value).pathname.split("/storage/v1/object/public/product-images/")[1] ?? "",
    ) || null;
  } catch {
    return null;
  }
}

export async function saveCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && !isSameOriginRequest(headerList)) {
    redirect("/admin/categories");
  }

  const limit = await limitAction("categories");
  if (!limit.allowed) {
    return { error: "Too many requests. Try again in a minute." };
  }

  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    sort_order: formData.get("sort_order"),
    image_url: formData.get("image_url") || undefined,
    parent_id: formData.get("parent_id") || undefined,
  });
  if (!parsed.success) {
    return { error: "Enter a category name of up to 60 characters." };
  }

  const supabase = await supabaseServer();
  const slug = safeSlug(parsed.data.name);
  const previous = parsed.data.id
    ? await supabase
        .from("categories")
        .select("image_url")
        .eq("id", parsed.data.id)
        .maybeSingle()
    : { data: null, error: null };
  if (previous.error) {
    log.error("category lookup failed", { code: previous.error.code });
    return { error: "Something went wrong. Please try again." };
  }

  const { data: existing } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("slug", slug)
    .neq("id", parsed.data.id ?? "");
  if (existing && existing.length > 0) {
    return { error: "A category with a similar name already exists." };
  }

  const values: {
    name: string;
    slug: string;
    sort_order: number;
    image_url: string | null;
    parent_id?: string | null;
  } = {
    name: parsed.data.name,
    slug,
    sort_order: parsed.data.sort_order,
    image_url: parsed.data.image_url ?? null,
  };
  if (parsed.data.parent_id !== undefined) {
    values.parent_id = parsed.data.parent_id ?? null;
  }

  const { error } = parsed.data.id
    ? await supabase
        .from("categories")
        .update(values)
        .eq("id", parsed.data.id)
    : await supabase.from("categories").insert(values);

  if (error) {
    log.error("category save failed", { code: error.code });
    return { error: "Something went wrong. Please try again." };
  }

  const oldImagePath = storagePathFromPublicUrl(previous.data?.image_url);
  const newImagePath = storagePathFromPublicUrl(values.image_url);
  if (oldImagePath && oldImagePath !== newImagePath) {
    const { error: removeError } = await supabase.storage
      .from("product-images")
      .remove([oldImagePath]);
    if (removeError) {
      log.warn("category image cleanup failed", { code: removeError.name });
    }
  }

  updateTag("public-catalog");
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
  return { success: "Category saved" };
}

export async function deleteCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  const limit = await limitAction("categories");
  if (!limit.allowed) {
    return { error: "Too many requests. Try again in a minute." };
  }

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Something went wrong. Please try again." };
  }

  const supabase = await supabaseServer();
  const { data: category, error: lookupError } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id.data)
    .maybeSingle();
  if (lookupError) {
    log.error("category lookup failed", { code: lookupError.code });
    return { error: "Something went wrong. Please try again." };
  }
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id.data);
  if (countError) {
    log.error("category delete count failed", { code: countError.code });
    return { error: "Something went wrong. Please try again." };
  }
  if ((count ?? 0) > 0) {
    return {
      error: `This category has ${count ?? 0} products. Move them to another category first.`,
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id.data);
  if (error) {
    log.error("category delete failed", { code: error.code });
    return { error: "Something went wrong. Please try again." };
  }

  const imagePath = storagePathFromPublicUrl(category?.image_url);
  if (imagePath) {
    const { error: removeError } = await supabase.storage
      .from("product-images")
      .remove([imagePath]);
    if (removeError) {
      log.warn("category image cleanup failed", { code: removeError.name });
    }
  }

  updateTag("public-catalog");
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
  return { success: "Category deleted" };
}
