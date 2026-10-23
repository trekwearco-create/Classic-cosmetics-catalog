export default function ShopNowButton({ href = "/shop", text = "Shop Now" }: { href?: string; text?: string }) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-between gap-6 overflow-hidden rounded-full border border-[#0C3B25] bg-[#0C3B25] px-8 py-3.5 shadow-sm transition-all duration-500 ease-out hover:bg-white hover:shadow-md hover:shadow-emerald-950/10 active:scale-[0.98]"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
      <span className="relative z-10 font-serif text-xs font-medium uppercase tracking-[0.26em] text-white transition-colors duration-500 group-hover:text-[#0C3B25]">
        {text}
      </span>
      <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0C3B25] transition-all duration-500 ease-out group-hover:bg-[#0C3B25] group-hover:text-white group-hover:translate-x-1">
        <svg className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </span>
    </a>
  );
}
