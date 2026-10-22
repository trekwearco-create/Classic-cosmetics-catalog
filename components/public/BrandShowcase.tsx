import Link from "next/link";

const FEATURED_BRANDS = [
  { name: "L'Oréal", count: "48+ Products", query: "L'Oreal", color: "#f87171" },
  { name: "Maybelline", count: "35+ Products", query: "Maybelline", color: "#fbbf24" },
  { name: "Medora", count: "60+ Shades", query: "Medora", color: "#f472b6" },
  { name: "Garnier", count: "25+ Products", query: "Garnier", color: "#34d399" },
  { name: "Dove", count: "20+ Products", query: "Dove", color: "#60a5fa" },
  { name: "Vince", count: "18+ Products", query: "Vince", color: "#a78bfa" },
  { name: "Tresemme", count: "15+ Products", query: "Tresemme", color: "#fb923c" },
  { name: "Saeed Ghani", count: "22+ Products", query: "Saeed Ghani", color: "#4ade80" },
];

export default function BrandShowcase() {
  return (
    <section aria-labelledby="brand-showcase-heading" className="py-6 sm:py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
            Authentic & Verified
          </p>
          <h2
            id="brand-showcase-heading"
            className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            Top Brands
          </h2>
        </div>
        <Link
          href="/brands"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline sm:text-sm"
        >
          All Brands &rarr;
        </Link>
      </div>

      {/* Grid of brand cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        {FEATURED_BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={`/?q=${encodeURIComponent(brand.query)}`}
            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                style={{ backgroundColor: brand.color }}
              >
                {brand.name.slice(0, 1)}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 group-hover:text-emerald-600">
                View &rarr;
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 sm:text-base">
                {brand.name}
              </h3>
              <p className="text-[11px] text-gray-500">{brand.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
