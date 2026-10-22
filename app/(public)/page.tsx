import type { Metadata } from "next";
import Link from "next/link";

import HeroSlider from "@/components/public/HeroSlider";
import CategoryRail from "@/components/public/CategoryRail";
import ProductRail from "@/components/public/ProductRail";
import PromoBanners from "@/components/public/PromoBanners";
import BrandShowcase from "@/components/public/BrandShowcase";
import TrustBadges from "@/components/public/TrustBadges";
import NewsSection from "@/components/public/NewsSection";
import SearchBar from "@/components/public/SearchBar";
import LoadMore from "@/components/public/LoadMore";
import ProductCard from "@/components/public/ProductCard";
import {
  listCategories,
  PAGE_SIZE,
  searchProductCards,
  getBestSellers,
  getLatestDrop,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Classic Cosmetics | Best Cosmetics Store in Pakistan | Authentic Beauty Products",
  description:
    "Experience 100% authentic cosmetics, skincare, perfumes, and beauty tools in Pakistan. Enjoy express nationwide delivery within 24 to 72 hours.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || null;
  const category = sp.category?.trim() || null;
  const page = Math.max(Number(sp.page ?? "1"), 1);

  // If the user performed a search or filtered by a category, render the catalog search view
  const isBrowsingAll = !q && !category;

  if (!isBrowsingAll) {
    const categories = await listCategories();
    const products = await searchProductCards({ q, category, page });
    const hasMore = products.length === PAGE_SIZE;
    const selectedCategory = categories.find((item) => item.slug === category);

    return (
      <main className="mt-4 flex flex-col gap-6 pb-12 md:mt-6 md:gap-8">
        <SearchBar />

        <section aria-labelledby="search-products-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {q ? "Search results" : selectedCategory?.name ?? "Catalog"}
              </p>
              <h1 id="search-products-heading" className="break-anywhere text-2xl font-extrabold text-gray-900 md:text-3xl">
                {q ? `Products for “${q}”` : selectedCategory ? selectedCategory.name : "All Products"}
              </h1>
            </div>
            {(q || category) && (
              <Link
                href="/"
                className="text-xs font-semibold text-gray-500 hover:text-emerald-700 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
              <p className="text-lg font-bold text-gray-900">No products found.</p>
              <p className="mt-2 text-sm text-gray-500">
                Try searching for brands like &quot;Maybelline&quot;, &quot;L&apos;Oreal&quot;, or browse our categories.
              </p>
              <Link
                className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
                href="/"
              >
                Back to Home
              </Link>
            </div>
          ) : hasMore ? (
            <LoadMore
              q={q ?? ""}
              category={category ?? ""}
              initialPage={page}
              initialHasMore={hasMore}
              initialItems={products}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  // Highfy-style full Home Page Experience
  const [categories, bestSellers, latestDrop] = await Promise.all([
    listCategories(),
    getBestSellers(8),
    getLatestDrop(8),
  ]);

  return (
    <main className="mt-3 flex flex-col gap-6 pb-12 sm:mt-5 sm:gap-8 md:gap-10">
      {/* 1. Highfy Mobile Search Bar */}
      <div className="md:hidden">
        <SearchBar />
      </div>

      {/* 2. Hero Banner Carousel */}
      <HeroSlider />

      {/* 3. Circular Category Stories Rail */}
      <CategoryRail categories={categories} />

      {/* 4. Best Sellers Rail / Collection */}
      <ProductRail
        title="Best Sellers"
        subtitle="Customer Favorites"
        viewAllHref="/categories"
        products={bestSellers}
      />

      {/* 5. Must-Haves Promo Duo Banners */}
      <PromoBanners />

      {/* 6. Top Brands Showcase */}
      <BrandShowcase />

      {/* 7. Latest Drop (New Arrivals) */}
      <ProductRail
        title="Latest Drop"
        subtitle="Fresh Arrivals"
        viewAllHref="/categories"
        products={latestDrop}
      />

      {/* 8. Trust Guarantees */}
      <TrustBadges />

      {/* 9. Latest News & Beauty Journal */}
      <NewsSection />
    </main>
  );
}
