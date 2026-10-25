import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Brands | Classic Cosmetics",
  description: "Browse 100% authentic cosmetics and skincare from verified top brands in Pakistan.",
};

const BRANDS = [
  { letter: "A", items: ["Anua", "Axis-Y", "AccuFix", "Arencia", "Aztec Secret"] },
  { letter: "B", items: ["Bioaqua", "Bioderma"] },
  { letter: "C", items: ["CeraVe", "Clear", "Cosrx"] },
  { letter: "D", items: ["Dove", "Dr. Althea", "Dermalogica"] },
  { letter: "E", items: ["EOS", "Esfolio", "Estelin"] },
  { letter: "G", items: ["Garnier", "Glysolid", "Glow & Lovely"] },
  { letter: "I", items: ["IKT", "Innisfree", "Isntree"] },
  { letter: "J", items: ["Jenpharm", "Janssen Cosmetics"] },
  { letter: "L", items: ["L'Oréal Paris", "LA Girl", "Laneige"] },
  { letter: "M", items: ["Maybelline New York", "Medora of London", "Miss Rose", "Medicube"] },
  { letter: "N", items: ["Neutrogena", "Nirvana Botanics", "Nexton"] },
  { letter: "O", items: ["Olay", "Ordinary"] },
  { letter: "R", items: ["Rederm", "Rivaj UK"] },
  { letter: "S", items: ["Saeed Ghani", "Studio 17", "Sudocrem", "Sunsilk"] },
  { letter: "T", items: ["Tresemme", "The Inkey List"] },
  { letter: "V", items: ["Vaseline", "Vince Care", "Vichy", "Vanicream"] },
];

export default function BrandsPage() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">Brands</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          Verified & 100% Original
        </p>
        <h1
          className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          style={{ fontFamily: "var(--font-display, serif)" }}
        >
          Brand Directory
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Discover our curated collection of verified Pakistani and imported beauty brands.
        </p>
      </div>

      {/* Alphabet Quick Nav */}
      <div className="mb-8 flex flex-wrap gap-1.5 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        {BRANDS.map((group) => (
          <a
            key={group.letter}
            href={`#brand-group-${group.letter}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-700 shadow-sm transition hover:bg-emerald-700 hover:text-white"
          >
            {group.letter}
          </a>
        ))}
      </div>

      {/* Brands Alphabetical Grid */}
      <div className="space-y-8">
        {BRANDS.map((group) => (
          <div key={group.letter} id={`brand-group-${group.letter}`} className="scroll-mt-20">
            <h2 className="mb-3 border-b border-gray-200 pb-2 text-xl font-extrabold text-gray-900">
              {group.letter}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {group.items.map((brand) => (
                <Link
                  key={brand}
                  href={`/?q=${encodeURIComponent(brand)}`}
                  className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md"
                >
                  <span className="font-semibold text-gray-800 group-hover:text-emerald-700 text-sm">
                    {brand}
                  </span>
                  <span className="text-gray-300 group-hover:text-emerald-600 text-xs">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
