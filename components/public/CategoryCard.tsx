import Image from "next/image";
import Link from "next/link";

import type { CategoryRow } from "@/lib/data";

export default function CategoryCard({ category }: { category: CategoryRow }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="flex min-w-0 flex-col items-center gap-2 text-center"
    >
      <span className="relative aspect-square w-full overflow-hidden rounded-full border bg-linen" style={{ borderColor: "var(--line)" }}>
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 768px) 140px, 24vw"
            className="object-cover"
          />
        ) : (
          <span
            className="grid h-full w-full place-items-center text-3xl font-semibold"
            style={{ color: "var(--ink-2)", fontFamily: "var(--font-display)" }}
            aria-hidden="true"
          >
            {category.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-sm font-semibold leading-tight">{category.name}</span>
    </Link>
  );
}
