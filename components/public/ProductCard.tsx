import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "@/components/public/AddToCartButton";
import type { ProductCardRow } from "@/lib/data";

export default function ProductCard({ product }: { product: ProductCardRow }) {
  return (
    <article className="card flex min-w-0 flex-col overflow-hidden">
      <Link href={`/product/${product.slug}`} className="group flex min-w-0 flex-1 flex-col">
        <div
          className="relative aspect-square w-full"
          style={{ background: "var(--linen)" }}
        >
          {product.cover_url ? (
            <Image
              src={product.cover_url}
              alt={product.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-contain"
            />
          ) : (
            <div className="grid h-full place-items-center" aria-hidden="true">
              <span className="text-xs" style={{ color: "var(--ink-2)" }}>
                No photo
              </span>
            </div>
          )}
          {!product.in_stock ? (
            <span className="badge-out absolute left-2 top-2">Out of stock</span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 p-2.5 pb-0 md:p-3 md:pb-0">
          <p className="truncate text-xs font-semibold" style={{ color: "var(--ink-2)" }}>
            {product.category_name}
          </p>
          <h3 className="clamp-2 text-sm font-bold leading-snug md:text-[15px]">
            {product.name}
          </h3>
          <div className="mt-1 flex min-h-5 items-center gap-1" aria-label={product.shade_colors.length ? "Available shades" : undefined}>
            {product.shade_colors.slice(0, 6).map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-3.5 w-3.5 rounded-full border"
                style={{ background: color, borderColor: "var(--line)" }}
              />
            ))}
          </div>
        </div>
      </Link>
      <div className="p-2.5 pt-2 md:p-3">
        <AddToCartButton
          product={{ id: product.id, slug: product.slug, name: product.name }}
          disabled={!product.in_stock}
        />
      </div>
    </article>
  );
}
