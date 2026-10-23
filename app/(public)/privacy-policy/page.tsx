import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Classic Cosmetics",
  description: "Official privacy policy for Classic Cosmetics Pakistan (classiccosmetics.pk). Learn how we protect and manage your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Privacy Policy</span>
      </nav>

      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-emerald-800">
          Official Store Policy · classiccosmetics.pk
        </p>
      </header>

      <div className="prose prose-emerald max-w-none text-sm sm:text-base leading-relaxed space-y-6">
        <p className="lead text-gray-700">
          Your privacy is important to us. This Privacy Policy explains how Classic Cosmetics collects,
          uses, and protects your information when you visit or purchase from our website (classiccosmetics.pk).
        </p>

        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-gray-700 mb-2">When you place an order or interact with our storefront, we collect:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>Full Name:</strong> For customer identification and parcel dispatch.</li>
            <li><strong>Phone Number:</strong> For SMS dispatch updates and delivery rider contact.</li>
            <li><strong>Email Address:</strong> For order confirmations and receipt records.</li>
            <li><strong>Delivery / Shipping Address:</strong> To deliver products accurately across Pakistan.</li>
            <li><strong>Payment & Order Details:</strong> Payment confirmation reference and item receipts.</li>
          </ul>
        </section>

        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
            <li>Process and deliver orders accurately to your destination.</li>
            <li>Contact you regarding important order updates, dispatch notes, or delivery confirmations.</li>
            <li>Process online payments securely through verified banking and wallet gateways.</li>
            <li>Provide dedicated customer support and address any inquiries.</li>
            <li>Continuously improve website usability and curate genuine beauty collections.</li>
            <li>Send promotional updates and special seasonal offers where permitted.</li>
          </ul>
        </section>

        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">3. Information Protection</h2>
          <p className="text-gray-700">
            We implement appropriate technical, administrative, and organizational security measures to protect
            your personal data against unauthorized access, loss, or misuse. We strictly do not sell, trade, or rent
            your personal data to any external marketing agencies or third parties.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
          <p className="text-gray-700">
            Your shipping and contact information is shared exclusively with trusted logistics partners (such as Bykea,
            TCS, PostEx, or courier services) and authorized payment gateways solely for the operational fulfillment of your orders.
          </p>
        </section>

        <section className="rounded-xl bg-gray-50 p-6 border border-gray-100">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">5. Cookies & Tracking</h2>
          <p className="text-gray-700">
            We use cookies to analyze web traffic, enhance your browsing experience, and remember your shopping preferences
            (such as items in your cart). You can disable cookies in your browser settings at any time.
          </p>
        </section>

        <section className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-3">6. Policy Updates</h2>
          <p className="text-gray-700">
            We reserve the right to modify this Privacy Policy as our services evolve. Any updates will be posted
            directly to this page with an updated effective date.
          </p>
        </section>

        <section className="rounded-xl bg-emerald-50/70 p-6 border border-emerald-200">
          <h2 className="font-serif text-xl font-bold text-emerald-950 mb-2">7. Contact Us</h2>
          <p className="text-emerald-900">
            If you have questions about your personal data or this Privacy Policy, please contact our support team:
          </p>
          <div className="mt-3 text-sm text-emerald-950 space-y-1">
            <p><strong>Email:</strong> support@classiccosmetic.pk / info.classiccosmetics@gmail.com</p>
            <p><strong>WhatsApp Support:</strong> +92 322 2495034</p>
            <p><strong>Website:</strong> classiccosmetics.pk</p>
          </div>
        </section>
      </div>
    </div>
  );
}
