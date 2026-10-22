"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import CartLink from "@/components/public/CartLink";

/* ── Icons (inline SVG, no external dep) ────────────────────── */
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

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ── Static nav data (will come from DB in Phase 7) ─────────── */
const NAV_ITEMS = [
  { label: "Skincare",        href: "/categories/skincare" },
  { label: "Makeup & Nails",  href: "/categories/makeup-nails" },
  { label: "Perfumes",        href: "/categories/perfumes" },
  { label: "Haircare",        href: "/categories/haircare" },
  { label: "Bodycare",        href: "/categories/bodycare" },
  { label: "Beauty Tools",    href: "/categories/beauty-tools" },
  { label: "Personal Care",   href: "/categories/personal-care" },
  { label: "Brands",          href: "/brands" },
];

/* ── Drawer ──────────────────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // trap focus & close on Escape
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
      {/* overlay */}
      <div
        className="drawer-overlay"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* drawer panel */}
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
              className="h-10 w-auto object-contain"
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
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="drawer-nav-item"
              onClick={onClose}
            >
              <span>{item.label}</span>
              <IconChevronRight />
            </Link>
          ))}
          <div
            style={{
              borderTop: "1px solid var(--line)",
              marginTop: 8,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Link href="/support/about-us"  className="drawer-nav-item is-sub" onClick={onClose}>About Us</Link>
            <Link href="/support/contact-us" className="drawer-nav-item is-sub" onClick={onClose}>Contact Us</Link>
            <Link href="/support/faqs"      className="drawer-nav-item is-sub" onClick={onClose}>FAQs</Link>
            <Link href="/track-order"       className="drawer-nav-item is-sub" onClick={onClose}>Track Your Order</Link>
          </div>
        </nav>
      </div>
    </>
  );
}

/* ── Header ──────────────────────────────────────────────────── */
export default function Header() {
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [scrolled,   setScrolled]     = useState(false);

  // shadow on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="wrap site-header-inner">

          {/* ── Left: hamburger (mobile) + desktop nav ── */}
          <div className="header-start">
            {/* hamburger — mobile only */}
            <button
              type="button"
              className="hamburger-btn lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              onClick={openDrawer}
            >
              <IconMenu />
            </button>

            {/* desktop nav links */}
            <nav className="desktop-nav" aria-label="Main navigation">
              {NAV_ITEMS.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="desktop-nav-link"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/brands" className="desktop-nav-link">
                Brands
              </Link>
            </nav>
          </div>

          {/* ── Centre: Logo ── */}
          <div className="flex justify-center">
            <Link href="/" aria-label="Classic Cosmetics home">
              <Image
                src="/logo.png"
                alt="Classic Cosmetics"
                width={130}
                height={52}
                priority
                className="h-[52px] w-auto object-contain md:h-[58px]"
              />
            </Link>
          </div>

          {/* ── Right: Search + Cart ── */}
          <div className="header-end">
            {/* search icon — links to search overlay (built in Phase 8) */}
            <Link
              href="/search"
              className="header-icon-btn"
              aria-label="Search"
            >
              <IconSearch />
            </Link>
            <CartLink />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
