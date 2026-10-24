import type { Metadata } from "next";
import Link from "next/link";

import CategoryChips from "@/components/public/CategoryChips";
import LoadMore from "@/components/public/LoadMore";
import ProductCard from "@/components/public/ProductCard";
import { listCategories, PAGE_SIZE, searchProductCards, type CategoryRow } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string | string[] }>;
};

function getCleanSlug(slugInput: string | string[] | undefined): string {
  if (!slugInput) return "";
  const rawSlug = Array.isArray(slugInput) ? slugInput.join("/") : slugInput;
  try {
    return decodeURIComponent(rawSlug).toLowerCase().trim();
  } catch {
    return String(rawSlug).toLowerCase().trim();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const cleanSlug = getCleanSlug(resolvedParams.slug);
    const categories = await listCategories();
    const segments = cleanSlug.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? cleanSlug;
    const category = categories.find(
      (c) =>
        c.slug.toLowerCase() === cleanSlug ||
        c.slug.toLowerCase() === lastSegment ||
        c.name.toLowerCase() === cleanSlug ||
        c.name.toLowerCase() === lastSegment,
    );

    return {
      title: category ? `${category.name} | Classic Cosmetics` : "Category | Classic Cosmetics",
      description: `Shop authentic ${category?.name ?? "cosmetics"} at Classic Cosmetics in Pakistan. Curated beauty catalog.`,
    };
  } catch {
    return {
      title: "Category | Classic Cosmetics",
    };
  }
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const cleanSlug = getCleanSlug(resolvedParams.slug);

  const categories = await listCategories();
  const segments = cleanSlug.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? cleanSlug;

  const category = categories.find(
    (item) =>
      item.slug.toLowerCase() === cleanSlug ||
      item.slug.toLowerCase() === lastSegment ||
      item.name.toLowerCase() === cleanSlug ||
      item.name.toLowerCase() === lastSegment,
  );

  // Null-Safe Check: return graceful state without throwing 101/500
  if (!category) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-serif text-[#0C3B25]">Category Not Found</h2>
        <Link className="mt-4 inline-block text-sm underline text-[#0C3B25]" href="/shop">
          Browse All Products
        </Link>
      </div>
    );
  }

  // Safe product search by category slug
  const products = await searchProductCards({
    q: null,
    category: category.slug,
    page: 1,
  });

  const hasMore = products.length === PAGE_SIZE;

  // Build hierarchical breadcrumbs: Home > Root > Subcategory > Child
  const breadcrumbTrail: CategoryRow[] = [];
  let currentCat: CategoryRow | undefined = category;
  let depthGuard = 0;
  while (currentCat && depthGuard < 10) {
    breadcrumbTrail.unshift(currentCat);
    currentCat = currentCat.parent_id
      ? categories.find((c) => c.id === currentCat?.parent_id)
      : undefined;
    depthGuard++;
  }

  // Immediate sub-categories (if any exist under current category)
  // OR siblings if it is a leaf category under a parent
  const children = categories.filter((c) => c.parent_id === category.id);
  const relevantCategories: CategoryRow[] =
    children.length > 0
      ? children
      : category.parent_id
      ? categories.filter((c) => c.parent_id === category.parent_id)
      : [];

  return (
    <main className="mt-4 flex flex-col gap-6 pb-14 sm:mt-6 sm:gap-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Hierarchical Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        {breadcrumbTrail.map((crumb, idx) => {
          const isLast = idx === breadcrumbTrail.length - 1;
          return (
            <span key={crumb.id} className="flex items-center gap-1.5">
              <span>/</span>
              {isLast ? (
                <span className="text-gray-900 font-semibold">{crumb.name}</span>
              ) : (
                <Link
                  href={`/categories/${crumb.slug}`}
                  className="hover:text-emerald-700 hover:underline"
                >
                  {crumb.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Category Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {breadcrumbTrail.length > 1 ? breadcrumbTrail[0]!.name : "Category"}
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
      {relevantCategories.length > 0 && (
        <CategoryChips categories={relevantCategories} active={category.slug} />
      )}

      {/* Products Grid or Graceful Empty State */}
      {products && products.length > 0 ? (
        hasMore ? (
          <LoadMore
            q=""
            category={category.slug}
            initialPage={1}
            initialHasMore
            initialItems={products}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )
      ) : (
        <div className="py-16 text-center text-[#14532d]">
          <p className="text-base font-serif">No products found in this category yet.</p>
          <p className="text-xs text-[#0C3B25]/70 mt-1">Check back soon for new arrivals!</p>
        </div>
      )}
    </main>
  );
}
