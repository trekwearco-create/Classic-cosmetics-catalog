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

const brandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Brand name is required").max(100),
  slug: z.string().trim().max(120).optional(),
  logo_url: z.string().trim().url("Invalid logo URL").or(z.literal("")).nullish(),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export type BrandFormState = {
  error?: string;
  success?: string;
};

function revalidateBrandLiveStorefront(slug?: string) {
  try {
    updateTag("public-catalog");
  } catch {}
  revalidatePath("/", "layout");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath("/brands");
  if (slug) {
    revalidatePath(`/brands/${slug}`);
  }
}

export async function saveBrandAction(
  _prev: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && !isSameOriginRequest(headerList)) {
    redirect("/admin/brands");
  }

  const limit = await limitAction("brands");
  if (!limit.allowed) {
    return { error: "Too many requests. Please wait a minute." };
  }

  const rawLogoUrl = formData.get("logo_url");
  const logoUrlClean = typeof rawLogoUrl === "string" && rawLogoUrl.trim() !== "" ? rawLogoUrl.trim() : null;

  const parsed = brandSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    logo_url: logoUrlClean,
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message;
    return { error: issue || "Please provide a valid brand name." };
  }

  const slug = parsed.data.slug?.trim()
    ? slugify(parsed.data.slug)
    : slugify(parsed.data.name);

  const supabase = await supabaseServer();

  if (parsed.data.id) {
    // Update existing brand
    const { error } = await supabase
      .from("brands")
      .update({
        name: parsed.data.name,
        slug,
        logo_url: parsed.data.logo_url || null,
        sort_order: parsed.data.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) {
      log.error("brand update failed", { code: error.code, message: error.message });
      if (error.code === "23505") {
        return { error: "A brand with this name or slug already exists." };
      }
      return { error: "Failed to update brand. Please try again." };
    }
  } else {
    // Insert new brand
    const { error } = await supabase.from("brands").insert({
      name: parsed.data.name,
      slug,
      logo_url: parsed.data.logo_url || null,
      sort_order: parsed.data.sort_order,
    });

    if (error) {
      log.error("brand insert failed", { code: error.code, message: error.message });
      if (error.code === "23505") {
        return { error: "A brand with this name or slug already exists." };
      }
      return { error: "Failed to create brand. Please try again." };
    }
  }

  revalidateBrandLiveStorefront(slug);
  return { success: "Brand saved successfully." };
}

export async function deleteBrandAction(
  _prev: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && !isSameOriginRequest(headerList)) {
    redirect("/admin/brands");
  }

  const limit = await limitAction("brands");
  if (!limit.allowed) {
    return { error: "Too many requests. Please wait a minute." };
  }

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { error: "Brand ID is required." };
  }

  const supabase = await supabaseServer();

  // Clear brand_id from products before deleting
  await supabase.from("products").update({ brand_id: null }).eq("brand_id", id);

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) {
    log.error("brand delete failed", { code: error.code, message: error.message });
    return { error: "Failed to delete brand." };
  }

  revalidateBrandLiveStorefront();
  return { success: "Brand deleted successfully." };
}
