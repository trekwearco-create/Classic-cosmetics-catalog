import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Classic Cosmetics",
  description: "Terms and Conditions of Classic Cosmetics Pakistan (classiccosmetics.pk). Guidelines, authenticity guarantee, accepted payments, and store policies.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Terms & Conditions</span>
      </nav>

      <header className="mb-8 border-b border-gray-200 pb-6">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800 border border-emerald-200 mb-2">
          Real Skincare. Lasting Glow.
        </span>
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-emerald-800">
          classiccosmetics.pk · Official Terms of Service
        </p>
      </header>

      <div className="prose prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-6">
        <p className="lead text-gray-700">
          Welcome to Classic Cosmetics. By browsing or purchasing through classiccosmetics.pk, you agree to comply with
          and be bound by the following Terms & Conditions.
        </p>

        {/* 1. General & Products */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">1. General & Products</h2>
          <p className="text-gray-700">
            We strive to display product colors, descriptions, formulations, and usage instructions with maximum precision.
            However, slight manufacturer packaging redesigns, formula revisions, and international batch variations may occur.
          </p>
        </section>

        {/* 2. Authenticity */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">2. Authenticity Guarantee</h2>
          <p className="text-gray-700">
            We maintain a strict zero-tolerance policy against fake cosmetics. Every product listed in our catalog is
            100% authentic, verified, and sourced directly from official brand manufacturers and authorized global distributors.
          </p>
        </section>

        {/* 3. Pricing */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">3. Pricing & Currency</h2>
          <p className="text-gray-700">
            All prices on our storefront are quoted in Pakistani Rupees (PKR). We reserve the right to modify prices
            and rectify typographical or technical pricing errors prior to order fulfillment.
          </p>
        </section>

        {/* 4. Payment Methods */}
        <section className="rounded-xl bg-emerald-50/70 p-6 border border-emerald-200">
          <h2 className="font-serif text-xl font-bold text-emerald-950 mb-2">4. Accepted Payment Methods</h2>
          <p className="text-emerald-900 mb-3">
            To provide safe and streamlined processing, payments are accepted exclusively via verified electronic channels:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-white p-3 border border-emerald-200 text-center font-bold text-emerald-950 shadow-sm">
              JazzCash
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200 text-center font-bold text-emerald-950 shadow-sm">
              Easypaisa
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200 text-center font-bold text-emerald-950 shadow-sm">
              Direct Bank Transfer
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-800">
            Orders are queued and prepared for dispatch immediately upon successful payment verification.
          </p>
        </section>

        {/* 5. Order Confirmation & Cancellation */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">5. Order Confirmation & Cancellation</h2>
          <p className="text-gray-700">
            Automated confirmation receipts indicate receipt of your request but do not guarantee final dispatch if stock is compromised.
            Orders may be cancelled within <strong>24 hours</strong> of placement. Consignments that have already been handed over
            to courier services cannot be cancelled.
          </p>
        </section>

        {/* 6. Deliveries */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">6. Deliveries Across Pakistan</h2>
          <p className="text-gray-700">
            Shipments are handled via established third-party courier services (TCS, PostEx, Bykea, dedicated delivery riders).
            Customers are responsible for providing reachable telephone numbers and precise destination addresses.
          </p>
        </section>

        {/* 7. Hygiene & Safety */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">7. Hygiene, Safety & Patch Testing</h2>
          <p className="text-gray-700">
            We strongly advise performing a patch test on a small area of skin before applying any new skincare or cosmetic product.
            Classic Cosmetics is not liable for personal allergic reactions. In adherence with hygiene laws, opened or unsealed cosmetics are strictly non-returnable.
          </p>
        </section>

        {/* 8. User Accounts & Conduct */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">8. User Accounts & Platform Conduct</h2>
          <p className="text-gray-700">
            Users are responsible for safeguarding their login credentials. Any automated scraping, unauthorized exploitation,
            or fraudulent activity on classiccosmetics.pk will result in immediate IP blacklisting and potential legal action.
          </p>
        </section>

        {/* 9. Contact Support */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">9. Customer Support</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>WhatsApp:</strong> +92 322 2495034</p>
            <p><strong>Email:</strong> support@classiccosmetic.pk / info.classiccosmetics@gmail.com</p>
            <p><strong>Store:</strong> classiccosmetics.pk</p>
          </div>
        </section>
      </div>
    </div>
  );
}
