import Link from "next/link";

export default function ShopNowButton({
  href = "/categories",
  text = "Shop Now",
  className = "",
}: {
  href?: string;
  text?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-between gap-3 overflow-hidden rounded-full border border-[#0C3B25] bg-[#0C3B25] px-5 py-2.5 sm:px-6 sm:py-3 shadow-sm transition-all duration-500 ease-out hover:bg-white hover:shadow-md hover:shadow-emerald-950/10 active:scale-[0.98] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
      <span className="relative z-10 font-serif text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors duration-500 group-hover:text-[#0C3B25]">
        {text}
      </span>
      <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0C3B25] transition-all duration-500 ease-out group-hover:bg-[#0C3B25] group-hover:text-white group-hover:translate-x-0.5">
        <svg className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </span>
    </Link>
  );
}
