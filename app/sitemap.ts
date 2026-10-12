import type { MetadataRoute } from "next";
import { listCategoriesFallback } from "@/lib/data-category-fallback";

async function listProducts(): Promise<{ slug: string }[]> {
  try {
    const { searchProductCards } = await import("@/lib/data");
    const rows = await searchProductCards({ q: null, category: null, page: 1 });
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL ?? "https://classic-cosmetics.vercel.app";
  const categories = listCategoriesFallback();
  const products = await listProducts();
  const entries: MetadataRoute.Sitemap = [
    {
      url: site,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
  for (const c of categories) {
    entries.push({
      url: `${site}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const p of products) {
    entries.push({
      url: `${site}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  return entries;
}
