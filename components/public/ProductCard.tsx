import Image from "next/image";
import Link from "next/link";

import AddToCartButton from "@/components/public/AddToCartButton";
import type { ProductCardRow } from "@/lib/data";

/* ── Star rating (static 4.5 placeholder until reviews table is live) */
function Stars({ count = 4 }: { count?: number }) {
  return (
    <span className="stars" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true">
          {n <= count ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export default function ProductCard({ product }: { product: ProductCardRow }) {
  const hasShades   = product.shade_colors.length > 0;
  const inStock     = product.in_stock;
  const hasPrice    = product.price != null;
  const hasDiscount = product.discount_price != null && product.discount_price! < product.price!;
  const discountPct = hasDiscount
    ? Math.round((1 - product.discount_price! / product.price!) * 100)
    : 0;

  return (
    <article className="product-card card-hover">
      {/* ── Image area ── */}
      <Link href={`/product/${product.slug}`} prefetch={true} className="block" tabIndex={-1} aria-hidden="true">
        <div className="product-card-image">
          {product.cover_url ? (
            <Image
              src={product.cover_url}
              alt={product.name}
              fill
              unoptimized
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, 46vw"
              className="object-contain p-2"
            />
          ) : (
            <div
              className="grid h-full place-items-center"
              aria-hidden="true"
              style={{ color: "var(--ink-2)", fontSize: 12 }}
            >
              No photo
            </div>
          )}

          {/* Badges row: discount or sold out */}
          <div className="product-card-badges">
            {hasDiscount ? (
              <span className="badge-discount">{discountPct}% OFF</span>
            ) : !inStock ? (
              <span className="badge-out">Sold Out</span>
            ) : null}
          </div>

          {/* Quick-add bag button (only for products without shades) */}
          {!hasShades && inStock && (
            <AddToCartButton
              product={{
                id:       product.id,
                slug:     product.slug,
                name:     product.name,
                photoUrl: product.cover_url,
                price:    product.discount_price ?? product.price ?? null,
              }}
              inStock={inStock}
              iconOnly
            />
          )}
        </div>
      </Link>

      {/* ── Body ── */}
      <Link href={`/product/${product.slug}`} prefetch={true} className="product-card-body block min-w-0">
        {product.brand_name ? (
          <p className="clamp-1 text-[10px] uppercase tracking-wider text-emerald-800 font-medium">
            {product.brand_name}
          </p>
        ) : (
          <p className="clamp-1 text-label">{product.category_name}</p>
        )}
        <h3 className="clamp-2 mt-1 text-[13px] font-semibold leading-snug md:text-[14px]">
          {product.name}
        </h3>

        {/* Star rating + review count placeholder */}
        <div className="mt-1 flex items-center gap-1.5">
          <Stars count={4} />
          <span style={{ fontSize: 11, color: "var(--ink-2)" }}>(0)</span>
        </div>

        {/* Shade swatches */}
        {hasShades && (
          <div
            className="mt-1.5 flex min-h-4 items-center gap-1"
            aria-label="Available shades"
          >
            {product.shade_colors.slice(0, 7).map((color: string, i: number) => (
              <span
                key={`${color}-${i}`}
                className="inline-block h-3.5 w-3.5 rounded-full border"
                style={{ background: color, borderColor: "var(--line)" }}
              />
            ))}
            {product.shade_colors.length > 7 && (
              <span style={{ fontSize: 10, color: "var(--ink-2)" }}>
                +{product.shade_colors.length - 7}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {hasPrice && (
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            <span className="price-current">
              PKR {Math.round(hasDiscount ? product.discount_price! : product.price!).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="price-original">
                PKR {Math.round(product.price!).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* ── Footer: Choose Options (shades) or nothing (bag is on image) ── */}
      {hasShades && (
        <div className="product-card-footer">
          <Link
            href={`/product/${product.slug}`}
            className="btn-secondary w-full text-[13px]"
            style={{ minHeight: 38, borderWidth: 1.5 }}
          >
            Choose Options
          </Link>
        </div>
      )}
    </article>
  );
}
