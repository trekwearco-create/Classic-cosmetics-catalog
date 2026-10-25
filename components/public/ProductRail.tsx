"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/public/ProductCard";
import type { ProductCardRow } from "@/lib/data";

type ProductRailProps = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  products: ProductCardRow[];
  mobileLayout?: "rail" | "grid";
};

export default function ProductRail({
  title,
  subtitle,
  viewAllHref = "/categories",
  products,
  mobileLayout = "rail",
}: ProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-4 sm:py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          {subtitle && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
              {subtitle}
            </p>
          )}
          <h2
            className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline sm:text-sm"
            >
              <span>View all</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}

          {/* Desktop scroll arrows */}
          <div className="hidden items-center gap-1.5 md:flex ml-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label={`Scroll ${title} left`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label={`Scroll ${title} right`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Rail: Scroll snap on mobile (Shopify rail), or clean 2-col grid */}
      {mobileLayout === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 pt-1 px-0.5 scroll-smooth scrollbar-none sm:gap-4 md:grid md:grid-cols-4 md:overflow-visible"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[165px] flex-shrink-0 sm:w-[210px] md:w-auto"
              style={{ scrollSnapAlign: "start" }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
