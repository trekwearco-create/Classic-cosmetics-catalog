import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: "var(--white)", borderColor: "var(--line)" }}
    >
      <div className="site-header-grid wrap grid min-h-[98px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center md:min-h-[113px]">
        <Link
          href="/"
          aria-label="Classic Cosmetics home"
          className="col-start-2 row-start-1"
        >
          <Image
            src="/logo.png"
            alt="Classic Cosmetics"
            width={124}
            height={74}
            priority
            className="h-[74px] w-[124px] object-contain md:h-[89px] md:w-[150px]"
            style={{ display: "block" }}
          />
        </Link>
        <nav aria-label="Main navigation" className="col-start-1 row-start-1 flex items-center gap-2 md:gap-6">
          <Link           className="hidden min-h-11 items-center rounded-full px-2 text-sm font-semibold md:inline-flex md:text-base" href="/">
            Home
          </Link>
          <Link
            className="header-category-link inline-flex min-h-11 items-center rounded-full px-2 text-sm font-semibold md:text-base"
            href="/categories"
          >
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}
