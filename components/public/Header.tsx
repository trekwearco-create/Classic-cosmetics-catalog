import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: "var(--petal)", borderColor: "var(--line)" }}
    >
      <div className="wrap relative flex items-center justify-between py-2 md:static">
        <Link
          href="/"
          aria-label="Classic Cosmetics home"
          className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <Image
            src="/logo.png"
            alt="Classic Cosmetics"
            width={150}
            height={89}
            priority
            className="h-auto w-[124px] md:w-[150px]"
          />
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-2 md:gap-6">
          <Link className="hidden min-h-11 items-center rounded-full px-3 text-sm font-semibold md:inline-flex md:text-base" href="/">
            Home
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold md:text-base"
            href="/categories"
          >
            Categories
          </Link>
        </nav>
      </div>
    </header>
  );
}
