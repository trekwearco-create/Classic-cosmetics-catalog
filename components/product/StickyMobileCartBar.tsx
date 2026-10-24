"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart, type CartShade } from "@/components/public/CartProvider";
import type { ProductDetail } from "@/lib/data";

type StickyMobileCartBarProps = {
  product: ProductDetail;
  selectedShade: ProductDetail["shades"][number] | null;
  onSelectShade?: (shade: ProductDetail["shades"][number]) => void;
  onMissingShade?: () => void;
};

export default function StickyMobileCartBar({
  product,
  selectedShade,
  onSelectShade,
  onMissingShade,
}: StickyMobileCartBarProps) {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Slide up when user scrolls past 350px threshold
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const needsShade = product.shades.length > 0;
  const isAvailable = selectedShade ? selectedShade.is_available : true;
  const canAddToCart = product.in_stock && isAvailable;
  const thumbnail = selectedShade?.image_url ?? product.images[0]?.url ?? null;

  const handleAction = () => {
    if (!product.in_stock || submitting) return;

    if (needsShade && !selectedShade) {
      if (onMissingShade) {
        onMissingShade();
      } else {
        window.scrollTo({ top: 300, behavior: "smooth" });
      }
      return;
    }

    setSubmitting(true);
    const shadePayload: CartShade | null = selectedShade
      ? {
          id: selectedShade.id,
          code: selectedShade.code,
          name: selectedShade.name,
          imageUrl: selectedShade.image_url,
        }
      : null;

    const success = addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        photoUrl: thumbnail,
        shade: shadePayload,
      },
      product.in_stock,
      isAvailable,
    );

    if (success) {
      setSubmitting(false);
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-3 py-2 shadow-xl transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-label="Sticky mobile product checkout bar"
    >
      <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto">
        {/* Left: Thumbnail, title, shade name & dropdown (no price) */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {thumbnail ? (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <Image
                src={thumbnail}
                alt={product.name}
                fill
                unoptimized
                sizes="44px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              CC
            </div>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-xs font-bold text-gray-900 leading-tight">
              {product.name}
            </span>

            {needsShade ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                <select
                  value={selectedShade?.id ?? ""}
                  onChange={(e) => {
                    const found = product.shades.find((s) => s.id === e.target.value);
                    if (found && onSelectShade) onSelectShade(found);
                  }}
                  className="w-full max-w-[150px] truncate rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="" disabled>
                    {selectedShade ? selectedShade.name : "Choose Shade"}
                  </option>
                  {product.shades.map((shade) => (
                    <option
                      key={shade.id}
                      value={shade.id}
                      disabled={!shade.is_available}
                    >
                      {shade.code ? `${shade.code} ` : ""}{shade.name}{!shade.is_available ? " (Out)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-emerald-700 truncate">
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Green prominent CHECKOUT button */}
        <button
          type="button"
          onClick={handleAction}
          disabled={!canAddToCart || submitting}
          className="group relative flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-[#0C3B25] bg-[#0C3B25] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 ease-out active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white hover:text-[#0C3B25]"
        >
          <span className="absolute inset-0 h-full w-full bg-white transition-transform duration-300 ease-out -translate-y-full group-hover:translate-y-0 -z-0"></span>
          <span className="relative z-10 font-serif">
            {!product.in_stock
              ? "Out of Stock"
              : needsShade && !selectedShade
              ? "Select Shade"
              : submitting
              ? "Redirecting…"
              : "CHECKOUT"}
          </span>
          <svg
            className="relative z-10 h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
