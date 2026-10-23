import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Classic Cosmetics",
  description: "Official shipping and delivery policy for Classic Cosmetics Pakistan (classiccosmetics.pk). Timelines, couriers, and nationwide delivery terms.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Shipping Policy</span>
      </nav>

      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Shipping & Delivery Policy
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-emerald-800">
          classiccosmetics.pk · Effective: October 2026
        </p>
      </header>

      <div className="prose prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-6">
        <p className="lead text-gray-700">
          Classic Cosmetics is committed to providing reliable, safe, and prompt delivery of genuine cosmetics and
          skincare products across Pakistan. Please review our shipping policy details below.
        </p>

        {/* 1. Delivery Services */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">1. Delivery Services & Couriers</h2>
          <p className="text-gray-700">
            For Karachi orders, parcels are dispatched via Bykea, TCS, PostEx, or dedicated city delivery riders.
            For orders outside of Karachi, shipments are dispatched through TCS, PostEx, and reputable courier services
            with full tracking capabilities.
          </p>
        </section>

        {/* 2. Delivery Timelines */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">2. Delivery Timelines</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-emerald-50/70 p-4 border border-emerald-200">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Karachi Orders</span>
              <p className="mt-1 text-lg font-bold text-emerald-950">2 to 3 Working Days</p>
              <p className="text-xs text-emerald-800 mt-1">Dispatched via Bykea, dedicated express riders, or local courier.</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Other Cities in Pakistan</span>
              <p className="mt-1 text-lg font-bold text-gray-900">7 to 10 Working Days</p>
              <p className="text-xs text-gray-600 mt-1">Dispatched via TCS, PostEx, and national couriers.</p>
            </div>
          </div>
        </section>

        {/* 3. Order Processing */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">3. Order Processing</h2>
          <p className="text-gray-700">
            Parcels are prepared and dispatched promptly after payment verification and order confirmation.
            Orders confirmed on Sundays or gazetted public holidays are processed on the subsequent working day.
          </p>
        </section>

        {/* 4. Delivery Address & Responsibilities */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">4. Delivery Address & Responsibilities</h2>
          <p className="text-gray-700">
            Customers must provide a complete, accurate delivery address with relevant landmarks and an active, reachable
            mobile phone number. Any re-dispatch fees caused by incorrect addresses, unreachable contact numbers, or consignee
            unavailability will be billed to the customer.
          </p>
        </section>

        {/* 5. Delivery Charges */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">5. Delivery Charges</h2>
          <p className="text-gray-700">
            Delivery charges are calculated dynamically during checkout based on parcel destination city, volumetric size,
            weight, and current courier tariffs. Promotional free delivery is applied automatically when eligible order thresholds are met.
          </p>
        </section>

        {/* 6. Operational Delays */}
        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">6. Operational Delays</h2>
          <p className="text-gray-700">
            While we endeavor to deliver within the stated timeframes, unforeseen weather disruptions, strikes, road closures,
            public holidays, and peak courier transit congestion serve as practical operational considerations. Our team monitors
            delayed parcels actively.
          </p>
        </section>

        {/* 7. Receiving Parcels */}
        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">7. Receiving Parcels</h2>
          <p className="text-gray-700">
            Please inspect the outer package upon arrival before accepting it. If the parcel appears visibly torn, tampered with,
            or opened, notify the courier rider immediately and contact our support line with photos/unboxing videos within 24 hours.
          </p>
        </section>

        {/* 8. Coverage */}
        <section className="rounded-xl bg-emerald-50/70 p-6 border border-emerald-200">
          <h2 className="font-serif text-xl font-bold text-emerald-950 mb-2">8. Geographic Coverage</h2>
          <p className="text-emerald-900">
            Classic Cosmetics currently delivers exclusively within the borders of <strong>Pakistan</strong> across all major
            provinces and courier service areas.
          </p>
        </section>
      </div>
    </div>
  );
}
