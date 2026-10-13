"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-3 py-3 text-[15px] font-semibold"
            style={
              active
                ? { background: "var(--ink)", color: "var(--white)" }
                : undefined
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const logout = (
    <form action="/api/admin/logout" method="post">
      <button
        className="rounded-md px-3 py-3 text-[15px] font-semibold"
        style={{ color: "var(--rose)" }}
        type="submit"
      >
        Log out
      </button>
    </form>
  );

  return (
    <div className="min-h-dvh">
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 md:hidden"
        style={{ background: "var(--petal)", borderColor: "var(--line)" }}
      >
        <Link href="/admin" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Classic Cosmetics"
            width={130}
            height={77}
            className="h-auto w-[130px]"
            priority
          />
        </Link>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: "var(--line)" }}
        >
          Menu
        </button>
      </header>
      {menuOpen ? (
        <div
          className="border-b px-4 py-3 md:hidden"
          style={{ background: "var(--white)", borderColor: "var(--line)" }}
        >
          {navLinks}
          {logout}
        </div>
      ) : null}
      <div className="flex min-h-dvh max-md:min-h-0">
        <aside
          className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r p-6 md:flex"
          style={{ background: "var(--petal)", borderColor: "var(--line)" }}
        >
          <Link href="/admin" className="mb-8 block">
            <Image
              src="/logo.png"
              alt="Classic Cosmetics"
              width={130}
              height={77}
              className="h-auto w-[130px]"
              priority
            />
          </Link>
          {navLinks}
          <div className="mt-auto">{logout}</div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
