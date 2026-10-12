import Link from "next/link";

import type { CategoryRow } from "@/lib/data";

export default function CategoryChips({
  categories,
  active,
  q,
}: {
  categories: CategoryRow[];
  active: string | null;
  q: string | null;
}) {
  const buildHref = (slug: string | null) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (slug) sp.set("category", slug);
    const qs = sp.toString();
    return qs === "" ? "/" : `/?${qs}`;
  };

  return (
    <div className="overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex flex-nowrap gap-2 md:flex-wrap">
        <Link
          href={buildHref(null)}
          className="flex-none rounded-full border px-4 text-sm font-semibold leading-[40px]"
          style={
            !active
              ? { background: "var(--ink)", color: "var(--white)", borderColor: "var(--ink)" }
              : { background: "var(--white)", borderColor: "var(--line)" }
          }
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildHref(c.slug)}
            className="flex-none rounded-full border px-4 text-sm font-semibold leading-[40px]"
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
