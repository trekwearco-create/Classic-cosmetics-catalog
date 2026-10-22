"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { log } from "@/lib/log";
import { limitAction } from "@/lib/ratelimit";
import { isSameOriginRequest } from "@/lib/request-security";
import { isAdmin, supabaseServer } from "@/lib/supabase/server";

export type BannerFormState = {
  error?: string;
  success?: string;
};

const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  section_key: z.string().min(1).max(60),
  title: z.string().trim().max(120).nullish(),
  extra_text: z.string().trim().max(80).nullish(),
  link_url: z.string().trim().max(255).nullish(),
  image_url_desktop: z.string().trim().nullish(),
  image_url_mobile: z.string().trim().nullish(),
  alt: z.string().trim().max(120).nullish(),
  sort_order: z.coerce.number().int().min(0).max(9999),
  is_active: z.coerce.boolean().optional(),
});

export async function saveBannerAction(
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const admin = await isAdmin();
  if (!admin) redirect("/admin/login");

  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && !isSameOriginRequest(headerList)) {
    redirect("/admin/banners");
  }

  const limit = await limitAction("banners");
  if (!limit.allowed) {
    return { error: "Too many requests. Try again in a minute." };
  }

  const parsed = bannerSchema.safeParse({
    id: formData.get("id") || undefined,
    section_key: formData.get("section_key"),
    title: formData.get("title") || undefined,
    extra_text: formData.get("extra_text") || undefined,
    link_url: formData.get("link_url") || undefined,
    image_url_desktop: formData.get("image_url_desktop") || undefined,
    image_url_mobile: formData.get("image_url_mobile") || undefined,
    alt: formData.get("alt") || undefined,
    sort_order: formData.get("sort_order"),
    is_active: formData.get("is_active") === null ? true : formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return { error: "Please enter valid banner information." };
  }

  const supabase = await supabaseServer();
  const values = {
    section_key: parsed.data.section_key,
    title: parsed.data.title ?? null,
    extra_text: parsed.data.extra_text ?? null,
    link_url: parsed.data.link_url ?? null,
    image_url_desktop: parsed.data.image_url_desktop ?? null,
    image_url_mobile: parsed.data.image_url_mobile ?? null,
    alt: parsed.data.alt ?? parsed.data.title ?? null,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active !== false,
  };

  const { error } = parsed.data.id
    ? await supabase.from("banners").update(values).eq("id", parsed.data.id)
    : await supabase.from("banners").insert(values);

  if (error) {
    log.error("banner save failed", { code: error.code });
    return { error: "Could not save banner. Make sure database migration 006 is applied." };
  }

  try {
    updateTag("public-banners");
  } catch {}
  revalidatePath("/");
  revalidatePath("/admin/banners");
  return { success: "Banner saved successfully" };
}

export async function deleteBannerAction(
  _prev: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const admin = await isAdmin();
  if (!admin) redirect("/admin/login");

  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Invalid banner ID." };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("banners").delete().eq("id", id.data);
  if (error) {
    log.error("banner delete failed", { code: error.code });
    return { error: "Could not delete banner." };
  }

  try {
    updateTag("public-banners");
  } catch {}
  revalidatePath("/");
  revalidatePath("/admin/banners");
  return { success: "Banner deleted" };
}

export async function updateSectionAction(
  key: string,
  updates: { is_visible?: boolean; sort_order?: number; title?: string; bg_color?: string | null },
): Promise<{ success?: boolean; error?: string }> {
  const admin = await isAdmin();
  if (!admin) return { error: "Unauthorized" };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("home_sections").update(updates).eq("key", key);
  if (error) return { error: error.message };

  try {
    updateTag("public-banners");
  } catch {}
  revalidatePath("/");
  revalidatePath("/admin/banners");
  return { success: true };
}
