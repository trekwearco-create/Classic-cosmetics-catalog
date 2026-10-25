import Link from "next/link";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-gray-100 bg-white text-gray-900">
      {/* Upper Value Strip */}
      <div className="border-b border-gray-100 bg-gray-50/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#0C3B25] border border-emerald-100 text-lg shadow-2xs">
                🛡️
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#0C3B25]">100% Authentic Beauty</h4>
                <p className="text-xs text-gray-600">Directly sourced & verified</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#0C3B25] border border-emerald-100 text-lg shadow-2xs">
                ⚡
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#0C3B25]">Express Nationwide Dispatch</h4>
                <p className="text-xs text-gray-600">Delivered safely across Pakistan</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[#0C3B25] border border-emerald-100 text-lg shadow-2xs">
                💳
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#0C3B25]">Safe & Secure Payments</h4>
                <p className="text-xs text-gray-600">JazzCash, Easypaisa & Bank Transfer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="font-serif text-2xl font-black tracking-tight text-[#0C3B25]">
              Classic Cosmetics
            </h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0C3B25]">
              Real Skincare. Lasting Glow.
            </p>
            <p className="text-xs leading-relaxed text-gray-600">
              Pakistan&apos;s destination for 100% genuine skincare, cosmetics, beauty tools, and luxury fragrances.
            </p>
            <div className="pt-2">
              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-[#0C3B25] border border-emerald-200">
                classiccosmetics.pk
              </span>
            </div>
          </div>

          {/* Customer Care / Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3B25]">
              Policies & Help
            </h4>
            <ul className="space-y-2 text-xs text-gray-900">
              <li>
                <Link href="/privacy-policy" className="transition hover:text-[#0C3B25] hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="transition hover:text-[#0C3B25] hover:underline">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="transition hover:text-[#0C3B25] hover:underline">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-and-exchange" className="transition hover:text-[#0C3B25] hover:underline">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-[#0C3B25] hover:underline">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3B25]">
              About & Explore
            </h4>
            <ul className="space-y-2 text-xs text-gray-900">
              <li>
                <Link href="/about" className="transition hover:text-[#0C3B25] hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition hover:text-[#0C3B25] hover:underline">
                  Shop by Category
                </Link>
              </li>
              <li>
                <Link href="/brands" className="transition hover:text-[#0C3B25] hover:underline">
                  Verified Brands
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-[#0C3B25] hover:underline">
                  View Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support & Payments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3B25]">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-gray-900">
              <p>
                <strong className="text-gray-900 font-semibold">WhatsApp:</strong>{" "}
                <a
                  href="https://wa.me/923222495034"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0C3B25] underline text-gray-900 font-medium"
                >
                  +92 322 2495034
                </a>
              </p>
              <p>
                <strong className="text-gray-900 font-semibold">Email:</strong>{" "}
                <a
                  href="mailto:support@classiccosmetic.pk"
                  className="hover:text-[#0C3B25] underline text-gray-900 font-medium"
                >
                  support@classiccosmetic.pk
                </a>
              </p>
              <p className="text-[11px] text-gray-600 pt-2 font-medium">
                Accepted Payment Channels:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0C3B25] border border-emerald-200">
                  JazzCash
                </span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0C3B25] border border-emerald-200">
                  Easypaisa
                </span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0C3B25] border border-emerald-200">
                  Bank Transfer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-100 pt-6 text-center text-xs text-gray-900 font-medium">
          <p>© {currentYear} Classic Cosmetics (classiccosmetics.pk). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
