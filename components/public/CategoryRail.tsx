import Link from "next/link";
import Image from "next/image";
import type { CategoryRow } from "@/lib/data";

const DEFAULT_CATEGORIES = [
  { name: "Skincare", slug: "skincare", emoji: "✨", bg: "#fef3c7", border: "#fde68a" },
  { name: "Makeup", slug: "makeup-nails", emoji: "💄", bg: "#fce7f3", border: "#fbcfe8" },
  { name: "Haircare", slug: "haircare", emoji: "🌿", bg: "#dcfce7", border: "#bbf7d0" },
  { name: "K Beauty", slug: "skincare-korean-beauty", emoji: "🌸", bg: "#fee2e2", border: "#fecaca" },
  { name: "Beauty Tools", slug: "beauty-tools", emoji: "🪞", bg: "#ffedd5", border: "#fed7aa" },
  { name: "Personal Care", slug: "personal-care", emoji: "🧴", bg: "#fae8ff", border: "#f5d0fe" },
  { name: "Fragrances", slug: "perfumes", emoji: "💎", bg: "#ede9fe", border: "#ddd6fe" },
  { name: "Hair Tools", slug: "haircare-hair-styling-tools", emoji: "💇", bg: "#e0f2fe", border: "#bae6fd" },
];

export default function CategoryRail({
  categories = [],
}: {
  categories?: CategoryRow[];
}) {
  // If categories are passed from DB, combine or use them
  const items = categories.length > 0
    ? categories.slice(0, 10).map((c, idx) => {
        const fallback = DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length] ?? {
          name: "Beauty",
          slug: "beauty",
          emoji: "✨",
          bg: "#fef3c7",
          border: "#fde68a",
        };
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          image_url: c.image_url,
          emoji: fallback.emoji,
          bg: fallback.bg,
          border: fallback.border,
        };
      })
    : DEFAULT_CATEGORIES.map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        image_url: null,
        emoji: c.emoji,
        bg: c.bg,
        border: c.border,
      }));

  return (
    <section aria-labelledby="category-rail-heading" className="py-2 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="category-rail-heading" className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
          Shop by Category
        </h2>
        <Link
          href="/categories"
          prefetch={true}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline sm:text-sm"
        >
          View all
        </Link>
      </div>

      {/* Horizontal snap scroll on mobile, flex on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none sm:gap-6 md:gap-8">
        {items.map((cat) => {
          const href = cat.slug === "brands" ? "/brands" : `/categories/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={href}
              prefetch={true}
              className="group flex flex-col items-center gap-2 text-center flex-shrink-0 w-22 sm:w-24"
            >
              <div
                className="relative flex h-22 w-22 sm:h-24 sm:w-24 items-center justify-center rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-emerald-300"
                style={{
                  backgroundColor: cat.bg,
                }}
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover scale-110 transition-transform duration-300 group-hover:scale-125"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl select-none" aria-hidden="true">
                    {cat.emoji}
                  </span>
                )}
              </div>
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-gray-800 group-hover:text-emerald-700 sm:text-xs">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
