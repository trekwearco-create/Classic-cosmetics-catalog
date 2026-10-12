"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { log } from "@/lib/log";
import { limitAction } from "@/lib/ratelimit";
import { slugify } from "@/lib/slug";
import { isAdmin, supabaseServer } from "@/lib/supabase/server";

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  sort_order: z.coerce.number().int().min(0).max(9999),
  image_url: z
    .string()
    .url()
    .max(500)
    .refine((u) => u.includes("/storage/v1/object/public/product-images/"))
    .nullish(),
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
  const siteUrl = process.env.SITE_URL;
  if (origin && siteUrl && new URL(origin).host !== new URL(siteUrl).host) {
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
  });
  if (!parsed.success) {
    return { error: "Enter a category name of up to 60 characters." };
  }

  const supabase = await supabaseServer();
  const slug = safeSlug(parsed.data.name);

  const { data: existing } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("slug", slug)
    .neq("id", parsed.data.id ?? "");
  if (existing && existing.length > 0) {
    return { error: "A category with a similar name already exists." };
  }

  const values = {
    name: parsed.data.name,
    slug,
    sort_order: parsed.data.sort_order,
    image_url: parsed.data.image_url ?? null,
  };

  const { error } = parsed.data.id
    ? await supabase
        .from("categories")
        .update(values)
        .eq("id", parsed.data.id)
    : await supabase.from("categories").insert(values);

  if (error) {
    log.error("category save failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
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
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id.data);
  if (countError) {
    log.error("category delete count failed", countError);
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
    log.error("category delete failed", error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: "Category deleted" };
}
