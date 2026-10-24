"use client";

import { useEffect, useRef, useState, useCallback, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/public/CartProvider";
import WhatsAppOrderButton from "@/components/ui/WhatsAppOrderButton";

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, itemCount } = useCart();
  
  // Touch swipe-to-dismiss state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Touch handlers for swipe-to-dismiss (swipe right to close)
  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setIsSwiping(false);
      setTouchDeltaX(0);
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only allow horizontal swipe to the right
    if (deltaX > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      setIsSwiping(true);
      setTouchDeltaX(deltaX);
    }
  }, [touchStart]);

  const onTouchEnd = useCallback(() => {
    if (isSwiping && touchDeltaX > 80) {
      closeCart();
    }
    setTouchStart(null);
    setTouchDeltaX(0);
    setIsSwiping(false);
  }, [isSwiping, touchDeltaX, closeCart]);

  if (!isOpen) return null;

  const currentTranslateX = isSwiping && touchDeltaX > 0 ? touchDeltaX : 0;

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const p = item.price ?? 0;
    return sum + p * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog" aria-label="Cart Drawer">
      {/* Backdrop overlay with smooth blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: `translateX(${currentTranslateX}px)`,
            transition: isSwiping ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header: Center 'CART' with right Close button */}
          <div className="relative px-5 py-4 border-b border-gray-100 flex items-center justify-center bg-white z-10">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold tracking-widest text-gray-900 uppercase">
                Cart
              </h2>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors text-base font-bold"
              aria-label="Close cart drawer"
            >
              ✕
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 8.5h14v12H5z" />
                    <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-base font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Discover luxury cosmetics, skincare, and fragrances from our catalog.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-6 rounded-full bg-[#0C3B25] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#155d3a] transition-all cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => {
                const lineTotal = item.price ? item.price * item.quantity : null;
                return (
                  <div key={`${item.id}-${item.shade?.id ?? ""}`} className="py-4 flex gap-3.5 items-start">
                    {/* Thumbnail */}
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {item.shade?.imageUrl || item.photoUrl ? (
                        <Image
                          src={item.shade?.imageUrl ?? item.photoUrl ?? ""}
                          alt={item.name}
                          fill
                          sizes="72px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                          No photo
                        </div>
                      )}
                    </div>

                    {/* Info, Price & Quantity controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-sm font-bold text-gray-900 hover:text-emerald-800 line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.shade?.id ?? null)}
                          className="text-gray-400 hover:text-red-600 p-0.5 transition-colors text-xs font-bold"
                          aria-label={`Remove ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>

                      {item.shade && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Shade: <span className="font-medium text-gray-700">{item.shade.code ? `${item.shade.code} - ` : ""}{item.shade.name}</span>
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        {/* Quantity decrement/increment */}
                        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50/80">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                setQuantity(item.id, item.shade?.id ?? null, item.quantity - 1);
                              } else {
                                removeItem(item.id, item.shade?.id ?? null);
                              }
                            }}
                            className="h-7 w-7 flex items-center justify-center text-gray-600 hover:text-black font-bold text-xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.id, item.shade?.id ?? null, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center text-gray-600 hover:text-black font-bold text-xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Price display */}
                        {lineTotal !== null && lineTotal > 0 ? (
                          <span className="font-serif text-sm font-bold text-gray-900">
                            Rs. {lineTotal.toLocaleString()}
                          </span>
                        ) : item.price ? (
                          <span className="font-serif text-sm font-bold text-gray-900">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary Bar — Exclusively Animated WhatsApp Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex flex-col gap-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-600">Subtotal</span>
                <span className="font-serif text-base font-extrabold text-gray-900">
                  {subtotal > 0 ? `Rs. ${subtotal.toLocaleString()}` : `${itemCount} items`}
                </span>
              </div>

              {/* Animated WhatsApp Order Button (WhatsApp Number: 923222495034) */}
              <WhatsAppOrderButton
                cartItems={items}
                phoneNumber="923222495034"
                label="ORDER ON WHATSAPP"
                className="w-full py-4 text-xs font-bold tracking-widest shadow-lg"
              />

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Fast order confirmation directly on WhatsApp</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
