import Link from "next/link";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-gray-200 bg-[#0C3B25] text-white">
      {/* Upper Newsletter / Value Strip */}
      <div className="border-b border-emerald-900/60 bg-[#08291a] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-300 font-bold text-lg">
                🛡️
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">100% Authentic Beauty</h4>
                <p className="text-xs text-emerald-200/80">Directly sourced & verified</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-300 font-bold text-lg">
                ⚡
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Express Nationwide Dispatch</h4>
                <p className="text-xs text-emerald-200/80">Delivered safely across Pakistan</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/80 text-emerald-300 font-bold text-lg">
                💳
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Safe & Secure Payments</h4>
                <p className="text-xs text-emerald-200/80">JazzCash, Easypaisa & Bank Transfer</p>
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
            <h3 className="font-serif text-2xl font-black tracking-tight text-white">
              Classic Cosmetics
            </h3>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Real Skincare. Lasting Glow.
            </p>
            <p className="text-xs leading-relaxed text-emerald-100/80">
              Pakistan&apos;s destination for 100% genuine skincare, cosmetics, beauty tools, and luxury fragrances.
            </p>
            <div className="pt-2">
              <span className="inline-block rounded-full bg-emerald-900/90 px-3 py-1 text-[11px] font-semibold text-emerald-200 border border-emerald-700/60">
                classiccosmetics.pk
              </span>
            </div>
          </div>

          {/* Customer Care / Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Policies & Help
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                <Link href="/privacy-policy" className="transition hover:text-white hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="transition hover:text-white hover:underline">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="transition hover:text-white hover:underline">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-and-exchange" className="transition hover:text-white hover:underline">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-white hover:underline">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              About & Explore
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                <Link href="/about" className="transition hover:text-white hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition hover:text-white hover:underline">
                  Shop by Category
                </Link>
              </li>
              <li>
                <Link href="/brands" className="transition hover:text-white hover:underline">
                  Verified Brands
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition hover:text-white hover:underline">
                  View Shopping Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support & Payments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Direct Contact
            </h4>
            <div className="space-y-2 text-xs text-emerald-100/80">
              <p>
                <strong className="text-white">WhatsApp:</strong>{" "}
                <a
                  href="https://wa.me/923222495034"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 underline"
                >
                  +92 322 2495034
                </a>
              </p>
              <p>
                <strong className="text-white">Email:</strong>{" "}
                <a
                  href="mailto:support@classiccosmetic.pk"
                  className="hover:text-emerald-300 underline"
                >
                  support@classiccosmetic.pk
                </a>
              </p>
              <p className="text-[11px] text-emerald-300/80 pt-2">
                Accepted Payment Channels:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-white border border-emerald-800">
                  JazzCash
                </span>
                <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-white border border-emerald-800">
                  Easypaisa
                </span>
                <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-white border border-emerald-800">
                  Bank Transfer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-emerald-900/60 pt-6 text-center text-xs text-emerald-300/70">
          <p>© {currentYear} Classic Cosmetics (classiccosmetics.pk). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
