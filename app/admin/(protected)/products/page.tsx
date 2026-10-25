import type { Metadata } from "next";
import Link from "next/link";

import ProductsList from "@/components/admin/ProductsList";
import { listCategoriesAdmin, listProductsAdmin } from "@/lib/data-admin";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([
    listProductsAdmin({ q: sp.q, category: sp.category, sort: sp.sort }),
    listCategoriesAdmin(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Products
        </h1>
        <Link href="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </div>
      <ProductsList
        products={products}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        query={sp.q ?? ""}
        categoryId={sp.category ?? ""}
        sort={sp.sort ?? ""}
      />
    </div>
  );
}
