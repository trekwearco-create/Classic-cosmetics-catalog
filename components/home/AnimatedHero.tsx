"use client";

import Link from "next/link";

export default function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-white py-10 md:py-16 px-4 border-b border-emerald-50">
      {/* Subtle light emerald animated ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-emerald-600 blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
      </div>

      <div className="relative mx-auto max-w-5xl text-center z-10">
        {/* Green Badge */}
        <span className="inline-block rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-[#0C3B25]">
          Authentic Skincare &amp; Cosmetics
        </span>

        {/* Green Heading */}
        <h1 className="mt-3 sm:mt-4 font-serif text-2xl sm:text-4xl md:text-5xl font-normal leading-tight tracking-tight text-[#0C3B25]">
          Real Skincare. <span className="italic font-light text-emerald-700">Lasting Glow.</span>
        </h1>

        {/* Green Description Paragraph */}
        <p className="mx-auto mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-emerald-900 font-normal leading-relaxed">
          Discover genuine, carefully curated formulations from globally trusted and recognized beauty brands.
        </p>

        {/* Green Action Button */}
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            id="hero-explore-collection"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#0C3B25] px-7 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-md transition-all duration-300 hover:bg-[#14532d] hover:shadow-emerald-900/20 active:scale-[0.98]"
            href="/shop"
          >
            <span>Explore Collection</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0C3B25] transition-transform duration-300 group-hover:translate-x-1 text-xs">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
