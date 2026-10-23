"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import CartLink from "@/components/public/CartLink";
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

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── Fallback Category Tree if DB has no categories loaded ─── */
const DEFAULT_TREE: CategoryTreeNode[] = [
  { id: "1", name: "Skincare", slug: "skincare", sort_order: 10, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
  { id: "2", name: "Makeup & Nails", slug: "makeup-nails", sort_order: 20, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
  { id: "3", name: "Perfumes", slug: "perfumes", sort_order: 30, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
  { id: "4", name: "Haircare", slug: "haircare", sort_order: 40, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
  { id: "5", name: "Bodycare", slug: "bodycare", sort_order: 50, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
  { id: "6", name: "Beauty Tools", slug: "beauty-tools", sort_order: 60, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
  { id: "7", name: "Personal Care", slug: "personal-care", sort_order: 70, parent_id: null, image_url: null, show_in_menu: true, is_active: true, children: [] },
];

/* ── Mobile Drawer ─────────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
  tree,
}: {
  open: boolean;
  onClose: () => void;
  tree: CategoryTreeNode[];
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [expandedL1, setExpandedL1] = useState<string | null>(null);
  const [expandedL2, setExpandedL2] = useState<string | null>(null);

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
          <Link href="/" onClick={onClose} aria-label="Home">
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

        <nav className="drawer-body" aria-label="Mobile navigation">
          {tree.filter((c) => !c.parent_id).map((l1) => {
            const hasL2 = l1.children && l1.children.length > 0;
            const isL1Open = expandedL1 === l1.id;

            return (
              <div key={l1.id} className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/categories/${l1.slug}`}
                    className="flex-1 py-3.5 px-5 text-sm font-bold text-gray-900 hover:text-emerald-700"
                    onClick={onClose}
                  >
                    {l1.name}
                  </Link>
                  {hasL2 && (
                    <button
                      type="button"
                      onClick={() => setExpandedL1(isL1Open ? null : l1.id)}
                      className="p-3.5 text-gray-400 hover:text-gray-700"
                      aria-label={`Toggle ${l1.name} subcategories`}
                    >
                      <span className={`inline-block transition-transform duration-150 ${isL1Open ? "rotate-90" : ""}`}>
                        <IconChevronRight />
                      </span>
                    </button>
                  )}
                </div>

                {/* Level 2 Accordion */}
                {hasL2 && isL1Open && (
                  <div className="bg-gray-50/80 px-4 py-2 space-y-1">
                    {/* All <Category> link */}
                    <Link
                      href={`/categories/${l1.slug}`}
                      className="block py-1.5 px-3 text-xs font-bold text-emerald-700 hover:underline"
                      onClick={onClose}
                    >
                      All {l1.name} &rarr;
                    </Link>

                    {l1.children.map((l2) => {
                      const hasL3 = l2.children && l2.children.length > 0;
                      const isL2Open = expandedL2 === l2.id;

                      return (
                        <div key={l2.id} className="rounded-lg bg-white/80 p-1 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/categories/${l2.slug}`}
                              className="flex-1 py-1.5 px-2 text-xs font-semibold text-gray-800 hover:text-emerald-700"
                              onClick={onClose}
                            >
                              {l2.name}
                            </Link>
                            {hasL3 && (
                              <button
                                type="button"
                                onClick={() => setExpandedL2(isL2Open ? null : l2.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-700"
                                aria-label={`Toggle ${l2.name} items`}
                              >
                                <span className={`inline-block transition-transform duration-150 ${isL2Open ? "rotate-90" : ""}`}>
                                  <IconChevronRight />
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Level 3 Children */}
                          {hasL3 && isL2Open && (
                            <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-emerald-300 ml-2 mt-1">
                              {l2.children.map((l3) => (
                                <Link
                                  key={l3.id}
                                  href={`/categories/${l3.slug}`}
                                  className="block py-1 text-[11px] text-gray-600 hover:text-emerald-700"
                                  onClick={onClose}
                                >
                                  {l3.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* ── Main Header Component ─────────────────────────────────── */
export default function Header({
  categoryTree = [],
  menuLinks: _menuLinks = [],
}: {
  categoryTree?: CategoryTreeNode[];
  menuLinks?: MenuLinkRow[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<CategoryTreeNode | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tree = categoryTree.length > 0 ? categoryTree : DEFAULT_TREE;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleMouseEnter = (cat: CategoryTreeNode) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    if (cat.children && cat.children.length > 0) {
      setActiveMegaCategory(cat);
    } else {
      setActiveMegaCategory(null);
    }
  };

  const handleMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 150);
  };

  return (
    <>
      <header
        className={`site-header relative${scrolled ? " scrolled" : ""}`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="wrap site-header-inner">
          {/* Left: Mobile hamburger + Desktop Nav Links */}
          <div className="header-start flex items-center">
            <button
              type="button"
              className="hamburger-btn md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              onClick={openDrawer}
            >
              <IconMenu />
            </button>

            {/* Desktop Navigation: ONLY Root categories */}
            <nav className="desktop-nav hidden md:flex items-center gap-1" aria-label="Main navigation">
              {tree.filter((c) => !c.parent_id).slice(0, 7).map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = activeMegaCategory?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => handleMouseEnter(item)}
                    className="relative"
                  >
                    <Link
                      href={`/categories/${item.slug}`}
                      className="desktop-nav-link text-[13px] font-bold"
                      aria-expanded={isExpanded}
                    >
                      <span>{item.name}</span>
                      {hasChildren && (
                        <span className="opacity-60 text-[10px]">
                          <IconChevronDown />
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Centre: Logo */}
          <div className="flex justify-center">
            <Link href="/" aria-label="Classic Cosmetics home">
              <Image
                src="/logo.png"
                alt="Classic Cosmetics"
                width={130}
                height={52}
                priority
                className="h-[48px] w-auto object-contain md:h-[54px]"
              />
            </Link>
          </div>

          {/* Right: Search & Cart */}
          <div className="header-end flex items-center gap-2">
            <Link
              href="/#search-products-heading"
              className="header-icon-btn"
              aria-label="Search catalog"
            >
              <IconSearch />
            </Link>
            <CartLink />
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        {activeMegaCategory && activeMegaCategory.children && activeMegaCategory.children.length > 0 && (
          <div
            className="mega-menu absolute left-0 right-0 top-full z-50 border-t-2 border-emerald-700 bg-white shadow-2xl transition-all"
            onMouseEnter={() => {
              if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="wrap py-8">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-display)" }}>
                    {activeMegaCategory.name}
                  </h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    Explore All Collections
                  </span>
                </div>
                <Link
                  href={`/categories/${activeMegaCategory.slug}`}
                  onClick={() => setActiveMegaCategory(null)}
                  className="group inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <span>All {activeMegaCategory.name}</span>
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
              </div>

              {/* 3-level grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {activeMegaCategory.children.map((subcat) => (
                  <div key={subcat.id} className="space-y-2">
                    <Link
                      href={`/categories/${subcat.slug}`}
                      onClick={() => setActiveMegaCategory(null)}
                      className="block text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-emerald-700"
                    >
                      {subcat.name}
                    </Link>

                    {subcat.children && subcat.children.length > 0 && (
                      <ul className="space-y-1.5 border-l border-gray-100 pl-2.5">
                        {subcat.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/categories/${child.slug}`}
                              onClick={() => setActiveMegaCategory(null)}
                              className="block text-xs text-gray-600 transition hover:text-emerald-700 hover:translate-x-0.5"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        tree={tree}
      />
    </>
  );
}
