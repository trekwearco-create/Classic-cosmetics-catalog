"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

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
  const price = product.discount_price ?? product.price ?? 0;
  const isAvailable = selectedShade ? selectedShade.is_available : true;
  const canAddToCart = product.in_stock && isAvailable;

  const handleAction = () => {
    if (!product.in_stock) return;

    if (needsShade && !selectedShade) {
      if (onMissingShade) {
        onMissingShade();
      } else {
        window.scrollTo({ top: 300, behavior: "smooth" });
      }
      return;
    }

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
        photoUrl: selectedShade?.image_url ?? product.images[0]?.url ?? null,
        shade: shadePayload,
      },
      product.in_stock,
      isAvailable,
    );

    if (success) {
      setAdded(true);
      setTimeout(() => {
        router.push("/cart");
      }, 300);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-4 py-2.5 shadow-lg transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-label="Sticky mobile product checkout bar"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Left: Price & Variant dropdown */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-base font-extrabold text-gray-900 leading-none">
              Rs. {price.toLocaleString()}
            </span>
            {product.discount_price && product.price && product.discount_price < product.price ? (
              <span className="text-xs text-gray-400 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            ) : null}
          </div>

          {needsShade ? (
            <div className="mt-1">
              <select
                value={selectedShade?.id ?? ""}
                onChange={(e) => {
                  const found = product.shades.find((s) => s.id === e.target.value);
                  if (found && onSelectShade) onSelectShade(found);
                }}
                className="w-full max-w-[170px] truncate rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-800 focus:border-emerald-600 focus:outline-none"
              >
                <option value="" disabled>
                  {selectedShade ? selectedShade.name : "Select shade"}
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
            <span className={`text-[11px] font-semibold mt-0.5 truncate ${product.in_stock ? "text-emerald-700" : "text-rose-600"}`}>
              {product.in_stock ? "✓ Authentic In Stock" : "Out of stock"}
            </span>
          )}
        </div>

        {/* Right: Prominent action button with cart icon (#0C3B25) */}
        <button
          type="button"
          onClick={handleAction}
          disabled={!canAddToCart}
          className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0C3B25] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#082819]"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="font-serif font-bold whitespace-nowrap">
            {!product.in_stock
              ? "Out of Stock"
              : needsShade && !selectedShade
              ? "Select Shade"
              : added
              ? "Added!"
              : "Checkout"}
          </span>
        </button>
      </div>
    </div>
  );
}
