import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy | Classic Cosmetics",
  description: "Official 7-day returns and exchange policy for Classic Cosmetics Pakistan. Hygiene standards, eligible items, and quick request submission.",
};

export default function ReturnsAndExchangePage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Returns & Exchange</span>
      </nav>

      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Returns & Exchange Policy
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-emerald-800">
          Official Store Policy · classiccosmetics.pk
        </p>
      </header>

      <div className="prose prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-6">
        <p className="lead text-gray-700">
          Customer satisfaction and product authenticity are central to everything we do.
          Due to the personal nature of cosmetics, skincare, and fragrances, we maintain strict hygiene standards.
        </p>

        {/* 1. Return Window */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">1. 7-Day Return Window</h2>
          <p className="text-gray-700">
            All return or exchange requests must be submitted within <strong>7 days</strong> of parcel delivery.
            Requests submitted beyond 7 days cannot be entertained.
          </p>
        </section>

        {/* 2. Eligible Items */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">2. Eligible Items</h2>
          <p className="text-gray-700 mb-2">
            Items are eligible for return or replacement if:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>The item delivered is wrong, damaged, defective, or mismatched against your order receipt.</li>
            <li>The item is completely <strong>unopened, unused</strong>, with intact safety seals, manufacturer wrap, and original product packaging.</li>
            <li>For hygiene and health safety reasons, opened, tested, or swatched cosmetics or skincare cannot be returned under any circumstances.</li>
          </ul>
        </section>

        {/* 3. Non-Returnable Items */}
        <section className="rounded-xl bg-rose-50/60 p-6 border border-rose-200">
          <h2 className="font-serif text-xl font-bold text-rose-950 mb-3">3. Non-Returnable Items</h2>
          <ul className="list-disc pl-5 space-y-1 text-rose-900">
            <li>Any cosmetic, lip product, or foundation that has been swatched, tested, or opened.</li>
            <li>Skincare products with broken seal stickers or pumps that have been primed.</li>
            <li>Items returned without original brand boxes, barcode tags, or manufacturer packaging.</li>
            <li>Products damaged due to customer misuse, mishandling, or improper storage.</li>
            <li>Requests submitted after the 7-day delivery window has expired.</li>
          </ul>
        </section>

        {/* 4. Change of Mind */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">4. Change of Mind</h2>
          <p className="text-gray-700">
            Returns due to change of mind are accepted only if the product is 100% factory-sealed, pristine, and unopened.
            Acceptance is subject to physical verification upon return to our warehouse.
          </p>
        </section>

        {/* 5. Return Courier Charges */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">5. Return Courier Charges</h2>
          <p className="text-gray-700">
            Courier fees for change of mind or personal preference returns are borne entirely by the customer.
            Classic Cosmetics covers return shipping costs only in verified cases of transit damage or warehouse packing error.
          </p>
        </section>

        {/* 6. Refunds & Exchanges */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">6. Refunds & Exchanges</h2>
          <p className="text-gray-700">
            <strong>Refunds:</strong> Processed via your original payment channel (JazzCash, Easypaisa, or direct Bank Transfer)
            after returned items pass physical warehouse inspection.<br />
            <strong>Exchanges:</strong> Subject to product shade and warehouse inventory availability.
          </p>
        </section>

        {/* 7. Cancellation */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">7. Cancellation Policy</h2>
          <p className="text-gray-700">
            Orders may be cancelled within 24 hours of placement. Dispatched consignments already booked with couriers cannot be cancelled.
          </p>
        </section>

        {/* 8. Request Submission */}
        <section className="rounded-xl bg-emerald-50/70 p-6 border border-emerald-200">
          <h2 className="font-serif text-xl font-bold text-emerald-950 mb-2">8. How to Submit a Return Request</h2>
          <p className="text-emerald-900 mb-3">
            To submit a return or exchange request within the 7-day period, message our support team with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-emerald-950 text-sm">
            <li>Your Full Name and Order Number</li>
            <li>Item Name and Reason for Return</li>
            <li>Clear photos or an unboxing video showing the sealed item and shipping label</li>
          </ul>
          <div className="mt-4 pt-3 border-t border-emerald-200 text-sm text-emerald-950">
            <p><strong>WhatsApp Support:</strong> +92 322 2495034</p>
            <p><strong>Email:</strong> support@classiccosmetic.pk / info.classiccosmetics@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
