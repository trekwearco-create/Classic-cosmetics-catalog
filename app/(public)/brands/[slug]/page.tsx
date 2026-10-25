import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/public/ProductCard";
import { searchProductCards, listBrands } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dbBrands = await listBrands();
  const found = dbBrands.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  const brandName = found ? found.name : decodeURIComponent(slug).replace(/-/g, " ");
  const capitalized = brandName.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${capitalized} Products | Classic Cosmetics`,
    description: `Shop authentic ${capitalized} beauty and skincare products in Pakistan.`,
  };
}

export default async function BrandProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  const dbBrands = await listBrands();
  const found = dbBrands.find((b) => b.slug.toLowerCase() === slug.toLowerCase());
  const brandQuery = found ? found.name : decodeURIComponent(slug).replace(/-/g, " ");
  const brandDisplayName = found ? found.name : brandQuery.replace(/\b\w/g, (c) => c.toUpperCase());
  const products = await searchProductCards({ q: brandQuery, category: null, page: 1 });

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link href="/brands" className="hover:text-emerald-700 hover:underline">
          Brands
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">{brandDisplayName}</span>
      </nav>

      {/* Brand Header */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          Verified Brand Collection
        </p>
        <h1
          className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          {brandDisplayName}
        </h1>
        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
          Browse authentic {brandDisplayName} formulations and beauty essentials with nationwide dispatch.
        </p>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center shadow-xs">
          <p className="text-base font-bold text-gray-900">No products found for {brandDisplayName}.</p>
          <p className="mt-2 text-xs text-gray-500">
            Check back soon or browse our full brand directory.
          </p>
          <Link
            className="mt-5 inline-flex rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
            href="/brands"
          >
            All Brands
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
