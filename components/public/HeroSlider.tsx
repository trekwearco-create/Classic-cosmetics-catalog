"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

type Slide = {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  accentColor: string;
  tag: string;
};

const SLIDES: Slide[] = [
  {
    id: "glow-hours",
    badge: "Limited Time Offer",
    title: "Ramadan & Eid Glow Hours",
    subtitle: "Up to 40% OFF on Top Skincare, Serums & Sunscreens",
    ctaText: "Shop Skincare",
    ctaLink: "/categories/skincare",
    bgGradient: "linear-gradient(135deg, #0b2e1f 0%, #175438 50%, #1f7a4d 100%)",
    accentColor: "#f7d54a",
    tag: "SKINCARE DEALS",
  },
  {
    id: "k-beauty",
    badge: "100% Authentic",
    title: "Original K-Beauty Imports",
    subtitle: "Hydrating Essences, Capsule Mists & Glass Skin Essentials",
    ctaText: "Explore K-Beauty",
    ctaLink: "/categories/skincare",
    bgGradient: "linear-gradient(135deg, #18233a 0%, #203a5c 50%, #2f567f 100%)",
    accentColor: "#6ee7b7",
    tag: "KOREAN BEAUTY",
  },
  {
    id: "makeup-drop",
    badge: "Trending Now",
    title: "Velvet Lips & Flawless Base",
    subtitle: "Medora, Maybelline & L'Oréal Foundations & Lipsticks",
    ctaText: "Shop Makeup",
    ctaLink: "/categories/makeup-nails",
    bgGradient: "linear-gradient(135deg, #3d1223 0%, #611f38 50%, #852d4e 100%)",
    accentColor: "#f9a8d4",
    tag: "MAKEUP ESSENTIALS",
  },
  {
    id: "fragrances",
    badge: "Premium Fragrances",
    title: "Signature Scents & Perfumes",
    subtitle: "Long-lasting luxury perfumes and all-day body mists",
    ctaText: "Discover Perfumes",
    ctaLink: "/categories/perfumes",
    bgGradient: "linear-gradient(135deg, #2a1b3d 0%, #442a5d 50%, #613b7e 100%)",
    accentColor: "#c084fc",
    tag: "LUXURY SCENTS",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      aria-label="Promotional announcements"
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="relative min-w-full flex-shrink-0"
            style={{
              background: slide.bgGradient,
            }}
          >
            <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-6 text-white sm:min-h-[320px] sm:p-10 md:min-h-[380px] md:p-12 lg:min-h-[420px]">
              {/* Top Tag & Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(8px)",
                    color: slide.accentColor,
                  }}
                >
                  {slide.tag}
                </span>
                {slide.badge && (
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-gray-900">
                    {slide.badge}
                  </span>
                )}
              </div>

              {/* Main Text Content */}
              <div className="my-auto max-w-xl py-4">
                <h2
                  className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-display, serif)", lineHeight: 1.15 }}
                >
                  {slide.title}
                </h2>
                <p className="mt-2 text-sm text-white/85 sm:text-base md:text-lg">
                  {slide.subtitle}
                </p>
              </div>

              {/* CTA Button */}
              <div>
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-900 shadow-lg transition-transform hover:scale-105 active:scale-95 sm:text-sm"
                  style={{
                    backgroundColor: slide.accentColor,
                  }}
                >
                  <span>{slide.ctaText}</span>
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
              </div>
            </div>

            {/* Subtle decorative glow overlay */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: slide.accentColor }}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next Arrows (desktop & tablet) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-black/60 md:flex"
      >
        <svg
          width="18"
          height="18"
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

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md transition-colors hover:bg-black/60 md:flex"
      >
        <svg
          width="18"
          height="18"
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

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === idx
                ? "w-6 bg-white"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
