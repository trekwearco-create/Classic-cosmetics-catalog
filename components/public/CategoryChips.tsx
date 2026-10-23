import Link from "next/link";

import type { CategoryRow } from "@/lib/data";

export default function CategoryChips({
  categories,
  active,
}: {
  categories: CategoryRow[];
  active: string | null;
}) {
  const buildHref = (slug: string | null) =>
    slug ? `/categories/${slug}` : "/categories";

  const rootCategories = categories.filter((c) => !c.parent_id);
  const displayCategories = rootCategories.length > 0 ? rootCategories : categories;

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-nowrap gap-2 md:flex-wrap">
        <Link
          href={buildHref(null)}
          className="flex min-h-11 flex-none items-center rounded-full border px-4 text-sm font-semibold"
          style={
            !active
              ? { background: "var(--ink)", color: "var(--white)", borderColor: "var(--ink)" }
              : { background: "var(--white)", borderColor: "var(--line)" }
          }
        >
          All
        </Link>
        {displayCategories.map((c) => (
          <Link
            key={c.id}
            href={buildHref(c.slug)}
            className="flex min-h-11 flex-none items-center rounded-full border px-4 text-sm font-semibold"
            style={
              active === c.slug
                ? { background: "var(--ink)", color: "var(--white)", borderColor: "var(--ink)" }
                : { background: "var(--white)", borderColor: "var(--line)" }
            }
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
