import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: "var(--petal)", borderColor: "var(--line)" }}
    >
      <div className="wrap flex items-center justify-center py-2 md:justify-start">
        <Link href="/" aria-label="Classic Cosmetics home">
          <Image
            src="/logo.png"
            alt="Classic Cosmetics"
            width={150}
            height={89}
            priority
            className="h-auto w-[124px] md:w-[150px]"
          />
        </Link>
      </div>
    </header>
  );
}
