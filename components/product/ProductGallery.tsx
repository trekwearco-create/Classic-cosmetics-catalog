"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  onOpenViewer?: (index: number, trigger: HTMLButtonElement) => void;
};

export default function ProductGallery({
  images,
  productName,
  onOpenViewer,
}: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width > 0) {
      const idx = Math.round(el.scrollLeft / width);
      setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)));
    }
  }, [images.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset to first slide if images change
  useEffect(() => {
    setActiveIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [images]);

  const slideTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const targetIndex = Math.max(0, Math.min(index, images.length - 1));
    const width = el.clientWidth;
    el.scrollTo({ left: targetIndex * width, behavior: "smooth" });
    setActiveIndex(targetIndex);
  };

  if (!images || images.length === 0) {
    return (
      <div className="product-image-empty rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center aspect-square text-xs text-gray-400">
        No product images available
      </div>
    );
  }

  return (
    <div className="product-gallery w-full min-w-0" aria-label={`Images of ${productName}`}>
      {/* Scrollable Gallery Track */}
      <div
        ref={trackRef}
        className="product-gallery-track"
        key={images[0] ?? "empty"}
      >
        {images.map((url, index) => (
          <div className="product-gallery-slide" key={`${url}-${index}`}>
            <button
              ref={index === 0 ? triggerRef : undefined}
              type="button"
              className="product-photo-trigger group relative h-full w-full block cursor-zoom-in overflow-hidden"
              aria-label={`Open photo ${index + 1} of ${images.length} in full screen`}
              onPointerDown={(event) => {
                pointerStartRef.current = {
                  x: event.clientX,
                  y: event.clientY,
                };
                pointerMovedRef.current = false;
              }}
              onPointerMove={(event) => {
                const start = pointerStartRef.current;
                if (
                  start &&
                  (Math.abs(event.clientX - start.x) >= 8 ||
                    Math.abs(event.clientY - start.y) >= 8)
                ) {
                  pointerMovedRef.current = true;
                }
              }}
              onPointerCancel={() => {
                pointerMovedRef.current = true;
              }}
              onClick={(event) => {
                if (pointerMovedRef.current && event.detail !== 0) {
                  event.preventDefault();
                  pointerMovedRef.current = false;
                  return;
                }
                pointerMovedRef.current = false;
                onOpenViewer?.(index, event.currentTarget);
              }}
            >
              <Image
                src={url}
                alt={`${productName}${index ? `, image ${index + 1}` : ""}`}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                unoptimized
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-contain"
              />
              <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Swipe Indicators & Nav Arrows (Right below main image) */}
      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-between px-2 md:hidden">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => slideTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Previous product image"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Swipe Dots Indicator */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => slideTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === i
                    ? "h-2 w-5 bg-[#0C3B25]"
                    : "h-2 w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => slideTo(activeIndex + 1)}
            disabled={activeIndex === images.length - 1}
            aria-label="Next product image"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
