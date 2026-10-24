"use client";
import Link from "next/link";


export default function AnimatedHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#061b11] via-[#0C3B25] to-[#082618] py-20 md:py-28 text-white px-4">
      {/* Animated ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
      </div>

      {/* Decorative botanical SVG lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="400" cy="200" r="180" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="400" cy="200" r="280" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="400" cy="200" r="370" fill="none" stroke="white" strokeWidth="0.3" />
        <line x1="0" y1="200" x2="800" y2="200" stroke="white" strokeWidth="0.3" />
        <line x1="400" y1="0" x2="400" y2="400" stroke="white" strokeWidth="0.3" />
      </svg>

      <div className="relative mx-auto max-w-5xl text-center z-10">
        {/* Eyebrow badge */}
        <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300 backdrop-blur-md">
          Authentic Skincare &amp; Cosmetics
        </span>

        {/* Headline */}
        <h1 className="mt-6 font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-tight text-emerald-50">
          Real Skincare.{" "}
          <span className="italic font-light text-emerald-200">Lasting Glow.</span>
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-emerald-100/80 font-light leading-relaxed">
          Discover genuine, carefully curated formulations from globally trusted and recognized beauty brands.
        </p>

        {/* Trust micro-badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {["100% Original", "Verified Quality", "WhatsApp Support"].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-3 py-1 text-[11px] font-medium text-emerald-300 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              {badge}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            id="hero-explore-collection"
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full border border-emerald-300/40 bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#0C3B25] shadow-lg transition-all duration-300 hover:bg-[#0C3B25] hover:text-white"
            href="/shop"
          >
            <span>Explore Collection</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C3B25] text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#0C3B25]">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
