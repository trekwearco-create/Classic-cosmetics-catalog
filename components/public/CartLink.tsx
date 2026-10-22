"use client";

import Link from "next/link";
import { useCart } from "@/components/public/CartProvider";

export default function CartLink() {
  const { itemCount, ready, bumpKey } = useCart();
  return (
    <Link
      href="/cart"
      className="header-icon-btn"
      aria-label={ready ? `Cart, ${itemCount} items` : "Cart"}
    >
      <span className="relative">
        <svg
          key={bumpKey}
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className={bumpKey > 0 ? "cart-icon-bump" : undefined}
          aria-hidden="true"
        >
          <path d="M5 8.5h14v12H5z" />
          <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
        </svg>
        {ready && itemCount > 0 ? (
          <span className="cart-count-badge" aria-hidden="true">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
