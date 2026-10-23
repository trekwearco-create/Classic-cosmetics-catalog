import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Classic Cosmetics",
  description: "Learn about Classic Cosmetics Pakistan. Real Skincare. Lasting Glow. 100% authentic curated skincare and beauty essentials delivered nationwide.",
};

export default function AboutUsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">About Us</span>
      </nav>

      <header className="mb-10 text-center sm:text-left border-b border-gray-200 pb-8">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800 border border-emerald-200 mb-3">
          Real Skincare. Lasting Glow.
        </span>
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to Classic Cosmetics
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
          At Classic Cosmetics, we believe healthy, beautiful skin starts with authentic products and the right
          skincare routine. We are an online skincare and cosmetics store bringing genuine beauty essentials from trusted brands across Pakistan.
        </p>
      </header>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        {/* Mission */}
        <section className="rounded-2xl bg-gradient-to-br from-emerald-900 to-[#0C3B25] p-8 text-white shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🌟</span>
            <h2 className="font-serif text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-emerald-100 text-base leading-relaxed">
            To help you discover skincare products that make you feel confident in your own skin, curated with
            uncompromising quality, authenticity, and transparency.
          </p>
        </section>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold mb-4">
              🛡️
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">
              Authentic Products You Can Trust
            </h3>
            <p className="text-gray-600">
              We strictly source from dependable brands and authorized distributors with a complete zero-tolerance
              policy against counterfeits. Every item is verified for genuine batch freshness.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold mb-4">
              ✨
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-2">
              Skincare for Everyone
            </h3>
            <p className="text-gray-600">
              We curate tailored choices for diverse skin types, concerns, and budgets. From sensitive barrier repair
              and acne solutions to radiant glass-skin hydration.
            </p>
          </div>
        </div>

        {/* Commitment */}
        <section className="rounded-xl border border-gray-100 bg-gray-50 p-6 sm:p-8">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🤝</span> Our Commitment to You
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>100% Authentic Skincare:</strong> Verified directly from official channels.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Seamless Online Checkout:</strong> Quick, secure cashless payments.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Careful Order Handling:</strong> Double bubble-wrapped parcel safety.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Reliable Nationwide Shipping:</strong> Swift delivery across all cities in Pakistan.</span>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Transparent Customer Care:</strong> Real human support available on WhatsApp and email.</span>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="text-center py-6 border-t border-gray-100">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            More Than Just a Skincare Store
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            We are dedicated to supporting your everyday personal care journey, helping you glow with confidence every single day.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-[#0C3B25] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-md hover:bg-emerald-900 transition active:scale-95"
          >
            Explore Catalog
          </Link>
        </section>
      </div>
    </div>
  );
}
