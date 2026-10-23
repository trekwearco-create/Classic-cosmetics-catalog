import Link from "next/link";

import type { CategoryRow } from "@/lib/data";

export default function CategoryChips({
  categories,
  active,
}: {
  categories: CategoryRow[];
  active: string | null;
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-nowrap gap-2 md:flex-wrap">
        {categories.map((c) => {
          const isCurrent = active === c.slug;
          return (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className={`flex min-h-9 flex-none items-center rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                isCurrent
                  ? "border-[#0C3B25] bg-[#0C3B25] text-white shadow-xs"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-600 hover:text-emerald-700 shadow-2xs"
              }`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
