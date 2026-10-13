"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { formatMoney } from "@/lib/price";

type ApiCard = {
  slug: string;
  name: string;
  category_name: string;
  price: number;
  discount_price: number | null;
  in_stock: boolean;
  cover_url: string | null;
  shade_colors: string[];
};

function Card({ product }: { product: ApiCard }) {
  const price = product.discount_price ?? product.price;
  const percent =
    product.discount_price !== null && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;
  return (
    <Link href={`/product/${product.slug}`} className="card flex min-w-0 flex-col overflow-hidden">
      <div className="relative aspect-square w-full" style={{ background: "var(--blush)" }}>
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
        <h3 className="clamp-2 text-sm font-bold leading-snug md:text-[15px]">{product.name}</h3>
        {product.shade_colors.length > 0 ? (
          <div className="mt-1 flex items-center gap-1" aria-label="Available shades">
            {product.shade_colors.slice(0, 6).map((color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-3.5 w-3.5 rounded-full border"
                style={{ background: color, borderColor: "var(--line)" }}
              />
            ))}
          </div>
        ) : null}
        <p className="mt-auto pt-1 text-sm md:text-[15px]">
          <b>{formatMoney(price)}</b>
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

export default function LoadMore({
  q,
  category,
  initialPage,
  initialHasMore,
  initialItems,
}: {
  q: string;
  category: string;
  initialPage: number;
  initialHasMore: boolean;
  initialItems: ApiCard[];
}) {
  const [items, setItems] = useState(() => initialItems);
  const [page, setPage] = useState(() => initialPage);
  const [hasMore, setHasMore] = useState(() => initialHasMore);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const guard = useRef(false);

  async function loadMore() {
    if (loading || guard.current) return;
    guard.current = true;
    setLoading(true);
    setRequestError(false);
    try {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (category) sp.set("category", category);
      sp.set("page", String(page + 1));
      const res = await fetch(`/api/products?${sp.toString()}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { products: ApiCard[] };
      setItems((prev) => [...prev, ...data.products]);
      setPage((p) => p + 1);
      setHasMore(data.products.length === 24);
    } catch {
      setRequestError(true);
    } finally {
      setLoading(false);
      guard.current = false;
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {items.map((p, i) => (
          <Card key={`${p.slug}-${i}`} product={p} />
        ))}
      </div>
      {hasMore ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          {requestError ? (
            <p className="text-sm font-semibold" role="alert" style={{ color: "var(--rose)" }}>
              Could not load more products. Please try again.
            </p>
          ) : null}
          <button
            className="btn-secondary"
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
          >
            {loading ? "Loading" : requestError ? "Try again" : "Load more products"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
