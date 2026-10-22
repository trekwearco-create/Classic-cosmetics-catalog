export default function TrustBadges() {
  const BADGES = [
    {
      title: "100% Authentic",
      desc: "Guaranteed original products sourced directly from authorized brand distributors.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Nationwide Express",
      desc: "Safe & prompt doorstep delivery within 24 to 72 hours all across Pakistan.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      title: "Dedicated Support",
      desc: "Friendly assistance on WhatsApp & phone with transparent exchange policies.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-label="Customer trust and guarantees" className="my-6 rounded-2xl border border-gray-100 bg-gray-50/80 p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
        {BADGES.map((b) => (
          <div key={b.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 shadow-sm">
              {b.icon}
            </div>
            <h3 className="mt-3 text-sm font-extrabold text-gray-900 sm:text-base">
              {b.title}
            </h3>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
