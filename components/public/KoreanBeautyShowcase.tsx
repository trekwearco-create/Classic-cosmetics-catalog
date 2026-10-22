import Link from "next/link";
import Image from "next/image";
import type { BannerRow } from "@/lib/data";

const DEFAULT_TILES = [
  { title: "Anua Heartleaf Soothing Toner", extra_text: "UPTO 30% OFF", link_url: "/categories/skincare-toners", image_url_desktop: null },
  { title: "Cosrx Advanced Snail 96 Mucin", extra_text: "UPTO 25% OFF", link_url: "/categories/skincare-serums-treatments", image_url_desktop: null },
  { title: "Beauty of Joseon Sun Relief", extra_text: "UPTO 35% OFF", link_url: "/categories/skincare-sun-protection", image_url_desktop: null },
  { title: "Axis-Y Dark Spot Glow Serum", extra_text: "UPTO 20% OFF", link_url: "/categories/skincare-serums-treatments", image_url_desktop: null },
  { title: "Skin1004 Madagascar Centella", extra_text: "UPTO 40% OFF", link_url: "/categories/skincare-serums-treatments", image_url_desktop: null },
  { title: "Haruharu Wonder Black Rice Toner", extra_text: "UPTO 25% OFF", link_url: "/categories/skincare-toners", image_url_desktop: null },
  { title: "Round Lab Birch Juice Sunscreen", extra_text: "UPTO 30% OFF", link_url: "/categories/skincare-sun-protection", image_url_desktop: null },
  { title: "Laneige Lip Sleeping Mask", extra_text: "UPTO 15% OFF", link_url: "/categories/skincare-lip-treatments", image_url_desktop: null },
  { title: "Dr. Althea 345 Relief Cream", extra_text: "UPTO 20% OFF", link_url: "/categories/skincare-moisturizing-care", image_url_desktop: null },
];

export default function KoreanBeautyShowcase({
  banners = [],
  title = "Korean Beauty Essentials",
}: {
  banners?: BannerRow[];
  title?: string;
}) {
  const items = banners.length > 0 ? banners.slice(0, 9) : DEFAULT_TILES;

  return (
    <section aria-labelledby="k-beauty-heading" className="py-6">
      <div className="rounded-3xl border border-pink-100 bg-gradient-to-b from-pink-50/60 to-white p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-pink-100 pb-4">
          <div>
            <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-pink-800">
              K-Beauty Spotlight
            </span>
            <h2
              id="k-beauty-heading"
              className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl"
              style={{ fontFamily: "var(--font-display, serif)" }}
            >
              {title}
            </h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Directly imported 100% authentic Korean glass-skin serums, soothing toners & viral sunscreens.
            </p>
          </div>
          <Link
            href="/categories/skincare-korean-beauty"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 hover:text-pink-900 hover:underline sm:text-sm"
          >
            <span>View All K-Beauty</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 3x3 Grid of Tiles with UPTO X% OFF pills */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-3">
          {items.map((item, idx) => (
            <Link
              key={idx}
              href={item.link_url || "/categories/skincare-korean-beauty"}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-pink-300 hover:shadow-md"
            >
              {/* Discount Pill */}
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-block rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-white shadow-sm">
                  {item.extra_text || "UPTO 30% OFF"}
                </span>
                <span className="text-[10px] font-bold text-pink-600 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>

              {/* Image if available */}
              {item.image_url_desktop ? (
                <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl bg-pink-50">
                  <Image
                    src={item.image_url_desktop}
                    alt={item.title || "K-Beauty item"}
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="mb-3 flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-pink-50 to-rose-50 text-3xl">
                  ✨
                </div>
              )}

              {/* Title */}
              <h3 className="line-clamp-2 text-xs font-bold text-gray-800 group-hover:text-pink-700 sm:text-sm">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
