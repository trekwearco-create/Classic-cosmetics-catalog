"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import CartLink from "@/components/public/CartLink";
import SearchBar from "@/components/public/SearchBar";
import type { CategoryTreeNode, MenuLinkRow } from "@/lib/data";

/* ── Inline SVG Icons ────────────────────────────────────────── */
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

/* ── Fallback Main Categories ────────────────────────────────── */
const DEFAULT_MAIN_CATEGORIES = [
  { id: "1", name: "Skincare", slug: "skincare" },
  { id: "2", name: "Makeup", slug: "makeup" },
  { id: "3", name: "Perfumes", slug: "perfumes" },
  { id: "4", name: "Haircare", slug: "haircare" },
  { id: "5", name: "Bodycare", slug: "bodycare" },
  { id: "6", name: "Beauty Tools", slug: "beauty-tools" },
  { id: "7", name: "Personal Care", slug: "personal-care" },
];

/* ── Mobile Drawer (Flat Single-Level Categories) ────────────── */
function MobileDrawer({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string; slug: string }[];
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = drawerRef.current;
    el?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="drawer-overlay" aria-hidden="true" onClick={onClose} />
      <div
        ref={drawerRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
      >
        <div className="drawer-header">
          <Link href="/" prefetch={true} onClick={onClose} aria-label="Home">
            <Image
              src="/logo.png"
              alt="Classic Cosmetics"
              width={100}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="header-icon-btn"
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>

        <nav className="drawer-body p-4 space-y-1" aria-label="Mobile navigation">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center justify-between py-3 px-3 text-sm font-bold text-gray-900 rounded-lg hover:bg-gray-50 hover:text-[#0C3B25] transition-colors"
            onClick={onClose}
          >
            <span>Home</span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              prefetch={true}
              className="flex items-center justify-between py-3 px-3 text-sm font-semibold text-gray-800 rounded-lg hover:bg-gray-50 hover:text-[#0C3B25] transition-colors"
              onClick={onClose}
            >
              <span>{cat.name}</span>
            </Link>
          ))}

          <Link
            href="/brands"
            prefetch={true}
            className="flex items-center justify-between py-3 px-3 text-sm font-bold text-gray-900 rounded-lg hover:bg-gray-50 hover:text-[#0C3B25] transition-colors"
            onClick={onClose}
          >
            <span>Brands</span>
            <span className="text-xs text-[#0C3B25] font-semibold uppercase tracking-wider">
              Explore &rarr;
            </span>
          </Link>

          <Link
            href="/categories"
            prefetch={true}
            className="flex items-center justify-between py-3 px-3 text-xs font-bold text-emerald-800 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors mt-2"
            onClick={onClose}
          >
            <span>All Categories</span>
            <span>&rarr;</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

/* ── Main Header Component ─────────────────────────────────── */
export default function Header({
  categoryTree = [],
  categories: categoriesProp,
  menuLinks: _menuLinks = [],
}: {
  categoryTree?: CategoryTreeNode[];
  categories?: { id: string; name: string; slug: string; is_active?: boolean; show_in_menu?: boolean }[];
  menuLinks?: MenuLinkRow[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Derive flat main categories (strictly single-level)
  const categories = (() => {
    if (categoriesProp && categoriesProp.length > 0) {
      return categoriesProp.filter((c) => c.is_active !== false && c.show_in_menu !== false);
    }
    if (categoryTree && categoryTree.length > 0) {
      return categoryTree
        .filter((c) => c.is_active !== false && c.show_in_menu !== false)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }));
    }
    return DEFAULT_MAIN_CATEGORIES;
  })();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <header className={`site-header relative${scrolled ? " scrolled" : ""}`}>
        {/* Top Header Bar: Logo far left on Desktop, Search/Cart far right */}
        <div className="wrap flex items-center justify-between min-h-[64px] py-2 md:py-3.5">
          {/* Mobile Only: Left Hamburger Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="hamburger-btn"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              onClick={openDrawer}
            >
              <IconMenu />
            </button>
          </div>

          {/* Logo: Aligned to far left on Desktop (`md:justify-start`), Centered on Mobile */}
          <div className="flex items-center justify-center md:justify-start flex-1 md:flex-initial">
            <Link href="/" prefetch={true} aria-label="Classic Cosmetics home" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Classic Cosmetics"
                width={130}
                height={52}
                priority
                className="h-[44px] sm:h-[48px] md:h-[54px] w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Search Bar (Header center) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <SearchBar />
          </div>

          {/* Right Side: Cart Icon Button with count badge (`justify-end`, aligned to far right) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <CartLink />
          </div>
        </div>

        {/* Mobile Search Bar inside Header */}
        <div className="md:hidden px-4 pb-2.5 bg-white">
          <SearchBar />
        </div>

        {/* Navigation Row: Strictly Flat Single-Level Main Categories + Brands */}
        <div className="hidden md:block border-t border-gray-100 bg-white shadow-xs">
          <div className="wrap">
            <nav
              className="flex items-center justify-center gap-6 overflow-x-auto no-scrollbar py-2.5"
              aria-label="Main category navigation"
            >
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  prefetch={true}
                  className="text-xs uppercase tracking-wider text-gray-800 hover:text-[#0C3B25] whitespace-nowrap font-bold transition-colors"
                >
                  {cat.name}
                </Link>
              ))}

              {/* Brands Direct Link */}
              <Link
                href="/brands"
                prefetch={true}
                className="text-xs uppercase tracking-wider text-gray-800 hover:text-[#0C3B25] whitespace-nowrap font-bold transition-colors"
              >
                Brands
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        categories={categories}
      />
    </>
  );
}
