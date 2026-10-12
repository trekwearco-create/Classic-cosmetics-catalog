import type { Metadata } from "next";
import CategoryChips from "@/components/public/CategoryChips";
import LoadMore from "@/components/public/LoadMore";
import ProductCard from "@/components/public/ProductCard";
import { listCategories, searchProductCards } from "@/lib/data";
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
  const hasMore = products.length === 24;

  return (
    <main className="mt-4 flex flex-col gap-6 md:mt-6">
      <div
        className="flex flex-col gap-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <SearchBar />
        <div className="md:hidden">
          <CategoryChips
            categories={categories}
            active={category ?? (q ? 'category' : null)}
            q={q ?? ""}
          />
        </div>
      </div>

      <div className="md:hidden">
        <CategoryChips
          categories={categories}
          active={category ?? (q ? 'category' : null)}
          q={q ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {hasMore ? (
        <LoadMore
          q={q ?? ""}
          category={category ?? ""}
          initialPage={page}
          initialHasMore={hasMore}
          initialItems={products}
        />
      ) : null}
    </main>
  );
}
