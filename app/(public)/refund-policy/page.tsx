import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Classic Cosmetics",
  description: "Official refund policy for Classic Cosmetics Pakistan. Transparent conditions, order cancellation within 24 hours, and return processing.",
};

export default function RefundPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Refund Policy</span>
      </nav>

      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Refund Policy
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-emerald-800">
          Official Store Policy · classiccosmetics.pk
        </p>
      </header>

      <div className="prose prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-6">
        <p className="text-gray-700">
          At Classic Cosmetics, we take pride in offering genuine, high-quality skincare and cosmetics.
          Please review our official refund guidelines below.
        </p>

        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">1. Order Cancellation</h2>
          <p className="text-gray-700">
            Orders are eligible for cancellation and a full refund via the original payment method within <strong>24 hours</strong> of placement.
            After 24 hours, orders that have already been packaged, booked with couriers, or dispatched cannot be cancelled.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">2. Refund for Returned Products</h2>
          <p className="text-gray-700">
            Refunds for returned items are processed only after the returned goods are received safely at our fulfillment center
            and inspected in accordance with our <strong>Returns & Exchange</strong> policy conditions.
          </p>
        </section>

        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">3. Products in Transit</h2>
          <p className="text-gray-700">
            No refunds will be issued while parcels are actively in transit with our logistics partners. Once the parcel is delivered
            or returned to our facility, the standard return/refund process applies.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">4. Return Shipping Charges</h2>
          <p className="text-gray-700">
            The customer is responsible for courier and return shipping fees for returns requested due to change of mind or personal preference.
            Classic Cosmetics covers return shipping charges only if items arrived defective, damaged during courier transit, or mismatched against your invoice.
          </p>
        </section>

        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">5. Refund Processing</h2>
          <p className="text-gray-700">
            Approved refunds are reimbursed through your original payment method (JazzCash, Easypaisa, or direct Bank Transfer).
            Standard banking or wallet processing timelines (typically 3 to 7 business days) apply depending on your financial institution.
          </p>
        </section>

        <section className="rounded-xl bg-emerald-50/70 p-6 border border-emerald-200">
          <h2 className="font-serif text-xl font-bold text-emerald-950 mb-2">6. Contact Support</h2>
          <p className="text-emerald-900">
            To request a refund or check the status of a returned parcel, contact our support team with your order number and invoice:
          </p>
          <div className="mt-3 text-sm text-emerald-950 space-y-1">
            <p><strong>WhatsApp Support:</strong> +92 322 2495034</p>
            <p><strong>Email:</strong> support@classiccosmetic.pk / info.classiccosmetics@gmail.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
