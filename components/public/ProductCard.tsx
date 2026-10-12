import Image from "next/image";
import Link from "next/link";

import type { ProductCardRow } from "@/lib/data";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/price";

export default function ProductCard({ product }: { product: ProductCardRow }) {
  const price = effectivePrice(product);
  const percent = discountPercent(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="card group flex min-w-0 flex-col overflow-hidden"
    >
      <div
        className="relative aspect-square w-full"
        style={{ background: "var(--blush)" }}
      >
        {product.cover_url ? (
          <Image
            src={product.cover_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain"
          />
        ) : (
          <div className="grid h-full place-items-center" aria-hidden="true">
            <span className="text-xs" style={{ color: "rgba(0,0,0,.68)" }}>
              No photo
            </span>
          </div>
        )}
        {!product.in_stock ? (
          <span className="badge-out absolute left-2 top-2">Out of stock</span>
        ) : percent > 0 ? (
          <span className="badge-off absolute left-2 top-2">{percent}% OFF</span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 p-2.5 md:p-3">
        <p className="truncate text-xs font-semibold" style={{ color: "rgba(0,0,0,.68)" }}>
          {product.category_name}
        </p>
        <h3 className="clamp-2 text-sm font-bold leading-snug md:text-[15px]">
          {product.name}
        </h3>
        <p className="mt-auto pt-1 text-sm md:text-[15px]">
          <b style={{ fontWeight: 700 }}>{formatMoney(price)}</b>
          {percent > 0 && product.discount_price !== null ? (
            <s className="ml-1.5 text-xs" style={{ color: "rgba(0,0,0,.68)" }}>
              {formatMoney(product.price)}
            </s>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
