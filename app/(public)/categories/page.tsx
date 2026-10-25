import type { Metadata } from "next";
import Link from "next/link";

import CategoryCard from "@/components/public/CategoryCard";
import { listCategories } from "@/lib/data";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "All Categories | Classic Cosmetics",
  description: "Browse 100% authentic cosmetics, skincare, perfumes, haircare, and beauty tools by category.",
};

export default async function CategoriesPage() {
  const allCategories = await listCategories();
  const rootCategories = allCategories.filter((c) => !c.parent_id);
  const categories = rootCategories.length > 0 ? rootCategories : allCategories;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link href="/" prefetch={true} className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">Categories</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Browse
          </p>
          <h1
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            All Categories
          </h1>
        </div>
        <Link
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline sm:text-sm"
          href="/"
        >
          &larr; Back to Home
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
          <p className="text-lg font-bold text-gray-900">No categories found.</p>
          <Link
            className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
            href="/"
          >
            Explore Home
          </Link>
        </div>
      )}
    </main>
  );
}
