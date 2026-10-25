export default function TrustBadges() {
  const BADGES = [
    {
      title: "100% Authentic",
      desc: "Guaranteed original products sourced directly from authorized brand distributors.",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Direct Order",
      desc: "Swift inquiries, personalized shade advice, and instant WhatsApp confirmations.",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
    {
      title: "Dedicated Support",
      desc: "Friendly assistance on WhatsApp & phone with transparent exchange policies.",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      ),
    },
    {
      title: "Express Nationwide",
      desc: "Fast & reliable tracked dispatch delivered safely across Pakistan.",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-label="Customer trust and guarantees" className="w-full max-w-7xl mx-auto my-4">
      <div className="flex overflow-x-auto no-scrollbar scrollbar-none gap-3 px-4 py-4 md:grid md:grid-cols-4 md:gap-6 md:px-8">
        {BADGES.map((b) => (
          <div
            key={b.title}
            className="min-w-[150px] shrink-0 p-3 rounded-xl border border-gray-100 bg-white shadow-xs text-center flex flex-col items-center justify-center transition-all duration-200 hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              {b.icon}
            </div>
            <h3 className="mt-2 text-xs font-semibold text-gray-900 leading-tight">
              {b.title}
            </h3>
            <p className="mt-1 text-[10px] text-gray-500 leading-snug">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
