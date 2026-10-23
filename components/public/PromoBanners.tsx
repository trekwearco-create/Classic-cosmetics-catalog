import Image from "next/image";
import ShopNowButton from "@/components/ui/ShopNowButton";
import type { BannerRow } from "@/lib/data";

export default function PromoBanners({
  banners = [],
}: {
  banners?: BannerRow[];
}) {
  if (banners.length > 0) {
    return (
      <section aria-label="Curated promotions" className="py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {banners.map((b, idx) => (
            <div
              key={b.id}
              className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-md transition-transform duration-300 hover:shadow-lg sm:p-8"
              style={{
                background:
                  idx % 2 === 0
                    ? "linear-gradient(135deg, #0d3b27 0%, #175e3c 100%)"
                    : "linear-gradient(135deg, #4c1d2f 0%, #7c2d4d 100%)",
              }}
            >
              {b.image_url_desktop && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={b.image_url_desktop}
                    alt={b.alt || b.title || ""}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
              )}
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  {b.extra_text && (
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      {b.extra_text}
                    </span>
                  )}
                  {b.title && (
                    <h3
                      className="mt-3 text-xl font-extrabold sm:text-2xl"
                      style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                      {b.title}
                    </h3>
                  )}
                  {b.alt && (
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                      {b.alt}
                    </p>
                  )}
                </div>
                {b.link_url && (
                  <div className="mt-6">
                    <ShopNowButton href={b.link_url} text="Explore Collection" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
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
              <ShopNowButton href="/categories/skincare" text="Shop Skincare" />
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
              <ShopNowButton href="/categories/makeup-nails" text="Shop Makeup" />
            </div>
          </div>

          {/* Decorative ambient circle */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-rose-400/20 blur-2xl transition-all group-hover:scale-125" />
        </div>
      </div>
    </section>
  );
}
