import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabase/server";

export type SuggestionItem = {
  id: string;
  title: string;
  type: "product" | "category" | "brand";
  url: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 50);

  if (!q || q.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const supabase = supabasePublic();
    const clean = q.replace(/[\\%_]/g, (c) => `\\${c}`);

    const [productsRes, categoriesRes, brandsRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug")
        .ilike("name", `%${clean}%`)
        .eq("is_visible", true)
        .order("name")
        .limit(6),
      supabase
        .from("categories")
        .select("id, name, slug")
        .ilike("name", `%${clean}%`)
        .eq("is_active", true)
        .order("name")
        .limit(3),
      supabase
        .from("brands")
        .select("id, name, slug")
        .ilike("name", `%${clean}%`)
        .order("name")
        .limit(3),
    ]);

    const suggestions: SuggestionItem[] = [];

    // Brands
    (brandsRes.data ?? []).forEach((b) => {
      suggestions.push({
        id: `brand-${b.id}`,
        title: b.name,
        type: "brand",
        url: `/brands/${b.slug}`,
      });
    });

    // Categories
    (categoriesRes.data ?? []).forEach((c) => {
      suggestions.push({
        id: `category-${c.id}`,
        title: c.name,
        type: "category",
        url: `/categories/${c.slug}`,
      });
    });

    // Products
    (productsRes.data ?? []).forEach((p) => {
      suggestions.push({
        id: `product-${p.id}`,
        title: p.name,
        type: "product",
        url: `/product/${p.slug}`,
      });
    });

    // If query matched a brand (e.g. "medora") and product suggestions are few,
    // also retrieve products linked to that brand
    if (brandsRes.data && brandsRes.data.length > 0 && suggestions.length < 8) {
      const brandIds = brandsRes.data.map((b) => b.id);
      const { data: brandProducts } = await supabase
        .from("products")
        .select("id, name, slug")
        .in("brand_id", brandIds)
        .eq("is_visible", true)
        .limit(5);

      (brandProducts ?? []).forEach((p) => {
        if (!suggestions.some((s) => s.id === `product-${p.id}`)) {
          suggestions.push({
            id: `product-${p.id}`,
            title: p.name,
            type: "product",
            url: `/product/${p.slug}`,
          });
        }
      });
    }

    return NextResponse.json(
      { suggestions: suggestions.slice(0, 8) },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
