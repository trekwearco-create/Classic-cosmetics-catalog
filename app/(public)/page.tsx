import type { Metadata } from "next";
import Link from "next/link";

import CategoryCard from "@/components/public/CategoryCard";
import LoadMore from "@/components/public/LoadMore";
import ProductCard from "@/components/public/ProductCard";
import { listCategories, PAGE_SIZE, searchProductCards } from "@/lib/data";
import SearchBar from "@/components/public/SearchBar";

export const metadata: Metadata = {
  title: "Classic Cosmetics",
  description: "Elegance in Every Detail",
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

  const categories = await listCategories();
  const products = await searchProductCards({ q, category, page });
  const hasMore = products.length === PAGE_SIZE;
  const selectedCategory = categories.find((item) => item.slug === category);

  return (
    <main className="mt-4 flex flex-col gap-8 pb-8 md:mt-6 md:gap-10">
      <div className="flex flex-col gap-4">
        <SearchBar />
      </div>

      {categories.length > 0 ? (
        <section aria-labelledby="home-categories-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="home-categories-heading" className="text-xl md:text-2xl">
              Shop by category
            </h2>
            <Link className="text-sm font-semibold underline underline-offset-4" href="/categories">
              View all
            </Link>
          </div>
          <div className="category-rail">
            {categories.map((item) => (
              <CategoryCard key={item.id} category={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="home-products-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--ink-2)" }}>
              {q ? "Search results" : selectedCategory?.name ?? "Classic Cosmetics"}
            </p>
            <h1 id="home-products-heading" className="break-anywhere text-2xl md:text-3xl">
              {q ? `Products for “${q}”` : selectedCategory ? "Products" : "Our products"}
            </h1>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="card px-5 py-12 text-center">
            <p className="text-lg font-bold">No products found.</p>
            <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
              Try another search or browse all products.
            </p>
            <Link className="btn-secondary mt-5" href="/">
              View all products
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
          <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
