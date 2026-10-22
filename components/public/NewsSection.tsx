
const NEWS_ARTICLES = [
  {
    id: 1,
    tag: "Skincare Guide",
    title: "How to Build a High-Protection Summer Routine in Pakistan",
    excerpt: "Combat humidity and UV rays with lightweight SPF50 gels, antioxidant mists, and soothing hydration.",
    date: "Summer Edition",
    readTime: "3 min read",
  },
  {
    id: 2,
    tag: "Shade Guide",
    title: "The Ultimate Medora Lipstick Guide: Top 10 Bestselling Shades",
    excerpt: "Explore the most flattering matte pinks, terracotta nudes, and timeless classic reds for everyday elegance.",
    date: "Beauty Trends",
    readTime: "4 min read",
  },
  {
    id: 3,
    tag: "Store Update",
    title: "Classic Cosmetics Delivers 100% Authentic Beauty in 24-72 Hours",
    excerpt: "Our temperature-regulated packaging and direct-from-brand guarantee ensures you get pure, fresh makeup & skincare.",
    date: "Quality Promise",
    readTime: "2 min read",
  },
];

export default function NewsSection() {
  return (
    <section aria-labelledby="news-section-heading" className="py-6 sm:py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
            Beauty Journal
          </p>
          <h2
            id="news-section-heading"
            className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl"
            style={{ fontFamily: "var(--font-display, serif)" }}
          >
            Latest News & Guides
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {NEWS_ARTICLES.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700">
                  {item.tag}
                </span>
                <span>{item.readTime}</span>
              </div>
              <h3 className="mt-3 text-base font-bold text-gray-900 group-hover:text-emerald-700">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {item.excerpt}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-400">
              <span>{item.date}</span>
              <span className="text-emerald-700 group-hover:underline">Read article &rarr;</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
