import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryChips from "@/components/public/CategoryChips";
import LoadMore from "@/components/public/LoadMore";
import ProductCard from "@/components/public/ProductCard";
import { listCategories, PAGE_SIZE, searchProductCards } from "@/lib/data";

export const metadata: Metadata = {
  title: "Category",
  description: "Browse cosmetics in this category.",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    listCategories(),
    searchProductCards({ q: null, category: slug, page: 1 }),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const hasMore = products.length === PAGE_SIZE;

  return (
    <main className="mt-6 flex flex-col gap-6 pb-10 md:mt-8 md:gap-8">
      <div>
        <Link className="text-sm font-semibold underline underline-offset-4" href="/categories">
          All categories
        </Link>
        <p className="mt-4 text-sm font-semibold" style={{ color: "var(--ink-2)" }}>
          Browse category
        </p>
        <h1 className="break-anywhere text-3xl md:text-4xl">{category.name}</h1>
      </div>
      <CategoryChips categories={categories} active={slug} />
      {products.length === 0 ? (
        <div className="card px-5 py-12 text-center">
          <p className="text-lg font-bold">No products in this category yet.</p>
          <Link className="btn-secondary mt-5" href="/categories">
            Browse other categories
          </Link>
        </div>
      ) : hasMore ? (
        <LoadMore
          q=""
          category={slug}
          initialPage={1}
          initialHasMore
          initialItems={products}
        />
      ) : (
        <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
