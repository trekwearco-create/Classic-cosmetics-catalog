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

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── Fallback 3-Level Category Tree ─────────────────────────── */
const DEFAULT_TREE: CategoryTreeNode[] = [
  {
    id: "1",
    name: "Skincare",
    slug: "skincare",
    sort_order: 10,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "1-1",
        name: "Face Cleansing",
        slug: "face-cleansing",
        sort_order: 10,
        parent_id: "1",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "1-1-1", name: "Face Wash", slug: "skincare-face-wash", sort_order: 10, parent_id: "1-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-1-2", name: "Cleansing Balm", slug: "skincare-cleansing-balm", sort_order: 20, parent_id: "1-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-1-3", name: "Facial Scrubs", slug: "skincare-facial-scrubs", sort_order: 30, parent_id: "1-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "1-2",
        name: "Serums & Treatments",
        slug: "serums-treatments",
        sort_order: 20,
        parent_id: "1",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "1-2-1", name: "Niacinamide", slug: "skincare-niacinamide", sort_order: 10, parent_id: "1-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-2-2", name: "Salicylic Acid", slug: "skincare-salicylic", sort_order: 20, parent_id: "1-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-2-3", name: "Vitamin C", slug: "skincare-vitamin-c", sort_order: 30, parent_id: "1-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "1-3",
        name: "Moisturizing Care",
        slug: "moisturizing-care",
        sort_order: 30,
        parent_id: "1",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "1-3-1", name: "Day Creams", slug: "skincare-day-creams", sort_order: 10, parent_id: "1-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-3-2", name: "Night Creams", slug: "skincare-night-creams", sort_order: 20, parent_id: "1-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "1-4",
        name: "Sun Protection",
        slug: "sun-protection",
        sort_order: 40,
        parent_id: "1",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "1-4-1", name: "Sunscreen SPF 50+", slug: "skincare-sunscreen-spf50", sort_order: 10, parent_id: "1-4", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-4-2", name: "Sunblock & Gel", slug: "skincare-sunblock-gel", sort_order: 20, parent_id: "1-4", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "1-5",
        name: "Toners",
        slug: "toners",
        sort_order: 50,
        parent_id: "1",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "1-5-1", name: "Hydrating Toners", slug: "skincare-hydrating-toners", sort_order: 10, parent_id: "1-5", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-5-2", name: "Exfoliating Toners", slug: "skincare-exfoliating-toners", sort_order: 20, parent_id: "1-5", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "1-6",
        name: "Lip Treatments",
        slug: "lip-treatments",
        sort_order: 60,
        parent_id: "1",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "1-6-1", name: "Lip Balm", slug: "skincare-lip-balm", sort_order: 10, parent_id: "1-6", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "1-6-2", name: "Lip Mask", slug: "skincare-lip-mask", sort_order: 20, parent_id: "1-6", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Makeup & Nails",
    slug: "makeup-nails",
    sort_order: 20,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "2-1",
        name: "Face",
        slug: "makeup-face",
        sort_order: 10,
        parent_id: "2",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "2-1-1", name: "Foundation", slug: "makeup-foundation", sort_order: 10, parent_id: "2-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-1-2", name: "BB Cream & Skin Tints", slug: "makeup-bb-cream", sort_order: 20, parent_id: "2-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-1-3", name: "Concealer", slug: "makeup-concealer", sort_order: 30, parent_id: "2-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-1-4", name: "Compact Powder", slug: "makeup-face-powder", sort_order: 40, parent_id: "2-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-1-5", name: "Color Corrector", slug: "makeup-color-corrector", sort_order: 50, parent_id: "2-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-1-6", name: "Primer", slug: "makeup-primer", sort_order: 60, parent_id: "2-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "2-2",
        name: "Eyes",
        slug: "makeup-eyes",
        sort_order: 20,
        parent_id: "2",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "2-2-1", name: "Mascara", slug: "makeup-mascara", sort_order: 10, parent_id: "2-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-2-2", name: "Eyeliner", slug: "makeup-eyeliner", sort_order: 20, parent_id: "2-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-2-3", name: "Eyeshadow", slug: "makeup-eyeshadow", sort_order: 30, parent_id: "2-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-2-4", name: "Eyebrows", slug: "makeup-eyebrows", sort_order: 40, parent_id: "2-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "2-3",
        name: "Lips",
        slug: "makeup-lips",
        sort_order: 30,
        parent_id: "2",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "2-3-1", name: "Lipstick", slug: "makeup-lipstick", sort_order: 10, parent_id: "2-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-3-2", name: "Lip Gloss", slug: "makeup-lip-gloss", sort_order: 20, parent_id: "2-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-3-3", name: "Lip Liner", slug: "makeup-lip-liner", sort_order: 30, parent_id: "2-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "2-4",
        name: "Cheek",
        slug: "makeup-cheek",
        sort_order: 40,
        parent_id: "2",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "2-4-1", name: "Blush", slug: "makeup-blush", sort_order: 10, parent_id: "2-4", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-4-2", name: "Bronzer", slug: "makeup-bronzer", sort_order: 20, parent_id: "2-4", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-4-3", name: "Highlighter", slug: "makeup-highlighter", sort_order: 30, parent_id: "2-4", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "2-5",
        name: "Blending Essentials",
        slug: "blending-essentials",
        sort_order: 50,
        parent_id: "2",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "2-5-1", name: "Makeup Sponges", slug: "makeup-sponges", sort_order: 10, parent_id: "2-5", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-5-2", name: "Brushes", slug: "makeup-brushes", sort_order: 20, parent_id: "2-5", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "2-6",
        name: "Nail",
        slug: "nail",
        sort_order: 60,
        parent_id: "2",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "2-6-1", name: "Nail Polish", slug: "nail-polish", sort_order: 10, parent_id: "2-6", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "2-6-2", name: "Nail Remover", slug: "nail-remover", sort_order: 20, parent_id: "2-6", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Perfumes",
    slug: "perfumes",
    sort_order: 30,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "3-1",
        name: "Women Fragrances",
        slug: "women-fragrances",
        sort_order: 10,
        parent_id: "3",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "3-1-1", name: "Floral", slug: "perfumes-floral", sort_order: 10, parent_id: "3-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "3-1-2", name: "Sweet & Fruity", slug: "perfumes-sweet", sort_order: 20, parent_id: "3-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "3-2",
        name: "Men Fragrances",
        slug: "men-fragrances",
        sort_order: 20,
        parent_id: "3",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "3-2-1", name: "Woody & Spicy", slug: "perfumes-woody", sort_order: 10, parent_id: "3-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "3-2-2", name: "Fresh & Aquatic", slug: "perfumes-aquatic", sort_order: 20, parent_id: "3-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "3-3",
        name: "Body Mists",
        slug: "body-mists",
        sort_order: 30,
        parent_id: "3",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "3-3-1", name: "All-Day Mists", slug: "perfumes-all-day-mists", sort_order: 10, parent_id: "3-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Haircare",
    slug: "haircare",
    sort_order: 40,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "4-1",
        name: "Shampoos",
        slug: "haircare-shampoos",
        sort_order: 10,
        parent_id: "4",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "4-1-1", name: "Anti-Dandruff", slug: "haircare-anti-dandruff", sort_order: 10, parent_id: "4-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "4-1-2", name: "Color Protect", slug: "haircare-color-protect", sort_order: 20, parent_id: "4-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "4-2",
        name: "Conditioners",
        slug: "haircare-conditioners",
        sort_order: 20,
        parent_id: "4",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "4-2-1", name: "Deep Hydration", slug: "haircare-deep-hydration", sort_order: 10, parent_id: "4-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "4-3",
        name: "Hair Oils & Serums",
        slug: "hair-oils-serums",
        sort_order: 30,
        parent_id: "4",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "4-3-1", name: "Argan Oil", slug: "haircare-argan-oil", sort_order: 10, parent_id: "4-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
          { id: "4-3-2", name: "Rosemary Oil", slug: "haircare-rosemary-oil", sort_order: 20, parent_id: "4-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Bodycare",
    slug: "bodycare",
    sort_order: 50,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "5-1",
        name: "Body Wash",
        slug: "body-wash",
        sort_order: 10,
        parent_id: "5",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "5-1-1", name: "Shower Gels", slug: "bodycare-shower-gels", sort_order: 10, parent_id: "5-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "5-2",
        name: "Body Lotions",
        slug: "body-lotions",
        sort_order: 20,
        parent_id: "5",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "5-2-1", name: "Moisturizing Lotions", slug: "bodycare-lotions", sort_order: 10, parent_id: "5-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "5-3",
        name: "Deodorants",
        slug: "body-deodorants",
        sort_order: 30,
        parent_id: "5",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "5-3-1", name: "Roll-ons & Sprays", slug: "bodycare-roll-ons", sort_order: 10, parent_id: "5-3", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Beauty Tools",
    slug: "beauty-tools",
    sort_order: 60,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "6-1",
        name: "Makeup Brushes",
        slug: "beauty-brushes",
        sort_order: 10,
        parent_id: "6",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "6-1-1", name: "Brush Sets", slug: "tools-brush-sets", sort_order: 10, parent_id: "6-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "6-2",
        name: "Sponges & Puffs",
        slug: "beauty-sponges",
        sort_order: 20,
        parent_id: "6",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "6-2-1", name: "Powder Puffs", slug: "tools-powder-puffs", sort_order: 10, parent_id: "6-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "Personal Care",
    slug: "personal-care",
    sort_order: 70,
    parent_id: null,
    image_url: null,
    show_in_menu: true,
    is_active: true,
    children: [
      {
        id: "7-1",
        name: "Oral Care",
        slug: "oral-care",
        sort_order: 10,
        parent_id: "7",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "7-1-1", name: "Toothpaste", slug: "personal-toothpaste", sort_order: 10, parent_id: "7-1", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
      {
        id: "7-2",
        name: "Hand & Foot Care",
        slug: "hand-foot-care",
        sort_order: 20,
        parent_id: "7",
        image_url: null,
        show_in_menu: true,
        is_active: true,
        children: [
          { id: "7-2-1", name: "Hand Creams", slug: "personal-hand-creams", sort_order: 10, parent_id: "7-2", image_url: null, show_in_menu: true, is_active: true, children: [] },
        ],
      },
    ],
  },
];

/* ── Mobile Drawer (3-Level Nested Accordion) ───────────────── */
function MobileDrawer({
  open,
  onClose,
  roots,
}: {
  open: boolean;
  onClose: () => void;
  roots: CategoryTreeNode[];
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
          {roots.map((l1) => {
            const hasL2 = l1.children && l1.children.length > 0;
            const isL1Open = expandedL1 === l1.id;

            return (
              <div key={l1.id} className="border-b border-gray-100">
                {hasL2 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedL1(isL1Open ? null : l1.id);
                    }}
                    className="flex w-full items-center justify-between py-3.5 px-5 text-left text-sm font-bold text-gray-900 transition-colors hover:text-emerald-700 active:bg-gray-50"
                    aria-expanded={isL1Open}
                  >
                    <span>{l1.name}</span>
                    <span
                      className={`text-gray-400 transition-transform duration-200 ${
                        isL1Open ? "rotate-180 text-emerald-700" : ""
                      }`}
                    >
                      <IconChevronDown />
                    </span>
                  </button>
                ) : (
                  <Link
                    href={`/categories/${l1.slug}`}
                    className="flex w-full items-center justify-between py-3.5 px-5 text-sm font-bold text-gray-900 transition-colors hover:text-emerald-700 active:bg-gray-50"
                    onClick={onClose}
                  >
                    <span>{l1.name}</span>
                  </Link>
                )}

                {/* Level 2 Accordion Container */}
                {hasL2 && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isL1Open ? "max-h-[2600px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="bg-gray-50/90 px-4 py-2.5 space-y-1.5 border-t border-gray-100">
                      {/* View all link for root */}
                      <Link
                        href={`/categories/${l1.slug}`}
                        className="flex items-center justify-between py-1.5 px-3 text-xs font-bold text-emerald-800 hover:underline"
                        onClick={onClose}
                      >
                        <span>All {l1.name}</span>
                        <span>&rarr;</span>
                      </Link>

                      {l1.children.map((l2) => {
                        const hasL3 = l2.children && l2.children.length > 0;
                        const isL2Open = expandedL2 === l2.id;

                        return (
                          <div
                            key={l2.id}
                            className="rounded-lg bg-white border border-gray-100 shadow-xs overflow-hidden"
                          >
                            {hasL3 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedL2(isL2Open ? null : l2.id)
                                  }
                                  className="flex w-full items-center justify-between py-2.5 px-3 text-left text-xs font-semibold text-gray-800 hover:text-emerald-700 active:bg-gray-50"
                                  aria-expanded={isL2Open}
                                >
                                  <span>{l2.name}</span>
                                  <span
                                    className={`text-gray-400 transition-transform duration-200 ${
                                      isL2Open
                                        ? "rotate-180 text-emerald-700"
                                        : ""
                                    }`}
                                  >
                                    <IconChevronDown />
                                  </span>
                                </button>

                                {/* Level 3 Children Container */}
                                <div
                                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                                    isL2Open
                                      ? "max-h-[1200px] opacity-100"
                                      : "max-h-0 opacity-0"
                                  }`}
                                >
                                  <div className="pl-4 pr-3 py-1 space-y-1 border-l-2 border-emerald-500 ml-3 mb-2 mt-0.5">
                                    <Link
                                      href={`/categories/${l2.slug}`}
                                      className="block py-1 text-xs font-bold text-emerald-700 hover:underline"
                                      onClick={onClose}
                                    >
                                      All {l2.name} &rarr;
                                    </Link>
                                    {l2.children.map((l3) => (
                                      <Link
                                        key={l3.id}
                                        href={`/categories/${l3.slug}`}
                                        className="block py-1 text-[11px] text-gray-600 transition hover:text-emerald-700"
                                        onClick={onClose}
                                      >
                                        {l3.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <Link
                                href={`/categories/${l2.slug}`}
                                className="flex items-center justify-between py-2.5 px-3 text-xs font-semibold text-gray-800 hover:text-emerald-700"
                                onClick={onClose}
                              >
                                <span>{l2.name}</span>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Brands item (Direct link on mobile) */}
          <div className="border-b border-gray-100">
            <Link
              href="/brands"
              className="flex w-full items-center justify-between py-3.5 px-5 text-sm font-bold text-gray-900 transition-colors hover:text-emerald-700 active:bg-gray-50"
              onClick={onClose}
            >
              <span>Brands</span>
              <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                Explore &rarr;
              </span>
            </Link>
          </div>
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
  const allRoots = tree.filter((c) => !c.parent_id);

  // Exact 7 root categories in order
  const ROOT_SLUGS = [
    "skincare",
    "makeup-nails",
    "perfumes",
    "haircare",
    "bodycare",
    "beauty-tools",
    "personal-care",
  ];
  const orderedRoots = ROOT_SLUGS.map((slug) =>
    allRoots.find((c) => c.slug === slug),
  ).filter(Boolean) as CategoryTreeNode[];
  const remainingRoots = allRoots.filter(
    (c) => !ROOT_SLUGS.includes(c.slug),
  );
  const displayRoots =
    orderedRoots.length > 0
      ? [...orderedRoots, ...remainingRoots].slice(0, 7)
      : allRoots.slice(0, 7);

  // Ensure each root category has its full 3-level tree attached
  const fallbackMap = new Map(DEFAULT_TREE.map((c) => [c.slug, c]));
  const enhancedRoots = displayRoots.map((root) => {
    if (root.children && root.children.length > 0) {
      const hasGrandchildren = root.children.some(
        (c) => c.children && c.children.length > 0,
      );
      if (hasGrandchildren) {
        return root;
      }
    }
    const fallback =
      fallbackMap.get(root.slug) ||
      DEFAULT_TREE.find((f) => f.name.toLowerCase() === root.name.toLowerCase());
    if (fallback && fallback.children && fallback.children.length > 0) {
      return {
        ...root,
        children: fallback.children,
      };
    }
    return root;
  });

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
    }, 180);
  };

  return (
    <>
      <header
        className={`site-header relative${scrolled ? " scrolled" : ""}`}
        onMouseLeave={handleMouseLeave}
      >
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
            <Link href="/" aria-label="Classic Cosmetics home" className="flex items-center">
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

        {/* Navigation Row: ONLY Root Categories + Brands */}
        <div className="hidden md:block border-t border-gray-100 bg-white shadow-xs">
          <div className="wrap">
            <nav
              className="flex items-center justify-center gap-1 lg:gap-3 py-2.5"
              aria-label="Main category navigation"
            >
              {enhancedRoots.map((item) => {
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
                      className={`desktop-nav-link flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold transition-colors whitespace-nowrap ${
                        isExpanded
                          ? "text-emerald-700 bg-emerald-50/90 rounded-md"
                          : "text-gray-800 hover:text-emerald-700"
                      }`}
                      aria-expanded={isExpanded}
                    >
                      <span>{item.name}</span>
                      {hasChildren && (
                        <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-emerald-700" : ""}`}>
                          <IconChevronDown />
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}

              {/* Brands Direct Link */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMegaCategory(null)}
              >
                <Link
                  href="/brands"
                  className="desktop-nav-link flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-gray-800 hover:text-emerald-700 transition-colors whitespace-nowrap"
                >
                  <span>Brands</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Desktop 3-Level Mega Menu (Hover to Open) */}
        {activeMegaCategory &&
          activeMegaCategory.children &&
          activeMegaCategory.children.length > 0 && (
            <div
              className="mega-menu absolute left-0 right-0 w-full bg-white shadow-xl border-t border-gray-100 z-50 p-8 transition-all"
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current)
                  clearTimeout(megaMenuTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <div className="wrap">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-xl font-extrabold text-gray-900"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
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
                    <span className="transition-transform group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </div>

                {/* Sub-categories as Bold Column Headers, Sub-sub-categories below */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {activeMegaCategory.children.map((subcat) => (
                    <div key={subcat.id} className="space-y-2.5">
                      <Link
                        href={`/categories/${subcat.slug}`}
                        onClick={() => setActiveMegaCategory(null)}
                        className="block text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-emerald-700 transition-colors"
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
                                className="block text-xs text-gray-600 transition-colors hover:text-emerald-700 hover:translate-x-0.5 duration-150"
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
        roots={enhancedRoots}
      />
    </>
  );
}
