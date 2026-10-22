import Link from "next/link";

export default function PromoBanners() {
  return (
    <section aria-label="Curated promotions" className="py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Banner 1: Skincare */}
        <div
          className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-md transition-transform duration-300 hover:shadow-lg sm:p-8"
          style={{
            background: "linear-gradient(135deg, #0d3b27 0%, #175e3c 100%)",
          }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-emerald-300/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Skincare Favorites
              </span>
              <h3
                className="mt-3 text-xl font-extrabold sm:text-2xl"
                style={{ fontFamily: "var(--font-display, serif)" }}
              >
                Glow & Hydrate Routine
              </h3>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">
                Niacinamide serums, deep hydrating cleansers & daily sun protection.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/categories/skincare"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-emerald-900 transition-all hover:bg-emerald-50 active:scale-95"
              >
                <span>Shop Skincare</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Decorative ambient circle */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl transition-all group-hover:scale-125" />
        </div>

        {/* Banner 2: Makeup & Nails */}
        <div
          className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-md transition-transform duration-300 hover:shadow-lg sm:p-8"
          style={{
            background: "linear-gradient(135deg, #4c1d2f 0%, #7c2d4d 100%)",
          }}
        >
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-rose-300/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-200">
                Trending Shades
              </span>
              <h3
                className="mt-3 text-xl font-extrabold sm:text-2xl"
                style={{ fontFamily: "var(--font-display, serif)" }}
              >
                Velvet Lip & Nail Colors
              </h3>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">
                Long-lasting matte formulas, vibrant nail lacquers & base makeup.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/categories/makeup-nails"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-rose-950 transition-all hover:bg-rose-50 active:scale-95"
              >
                <span>Shop Makeup</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Decorative ambient circle */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-rose-400/20 blur-2xl transition-all group-hover:scale-125" />
        </div>
      </div>
    </section>
  );
}
