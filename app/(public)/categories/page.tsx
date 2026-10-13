import type { Metadata } from "next";
import Link from "next/link";

import CategoryCard from "@/components/public/CategoryCard";
import { listCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse cosmetics by category.",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="mt-6 pb-10 md:mt-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--ink-2)" }}>
            Classic Cosmetics
          </p>
          <h1 className="text-3xl md:text-4xl">Categories</h1>
        </div>
        <Link className="btn-secondary hidden sm:inline-flex" href="/">
          All products
        </Link>
      </div>
      {categories.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="card px-5 py-12 text-center">
          <p className="text-lg font-bold">No categories are available yet.</p>
          <Link className="btn-secondary mt-5" href="/">
            Back to products
          </Link>
        </div>
      )}
    </main>
  );
}
