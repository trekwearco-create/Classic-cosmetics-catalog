import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryChips from "@/components/public/CategoryChips";
import LoadMore from "@/components/public/LoadMore";
import ProductCard from "@/components/public/ProductCard";
import { listCategories, PAGE_SIZE, searchProductCards } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  return {
    title: category ? `${category.name} | Classic Cosmetics` : "Category | Classic Cosmetics",
    description: `Shop authentic ${category?.name ?? "cosmetics"} at Classic Cosmetics in Pakistan. Fast nationwide delivery.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    listCategories(),
    searchProductCards({ q: null, category: slug, page: 1 }),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const hasMore = products.length === PAGE_SIZE;

  return (
    <main className="mt-4 flex flex-col gap-6 pb-14 sm:mt-6 sm:gap-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-emerald-700 hover:underline">
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Category
          </p>
          <h1
            className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            {category.name}
          </h1>
        </div>
        <p className="text-xs font-semibold text-gray-500">
          Showing {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Category Chips Bar */}
      <CategoryChips categories={categories} active={slug} />

      {/* Products Grid or Empty State */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
          <p className="text-lg font-bold text-gray-900">No products in this category yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            Explore our other authentic beauty categories.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
            href="/categories"
          >
            Browse Other Categories
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
