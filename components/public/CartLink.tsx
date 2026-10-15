"use client";

import Link from "next/link";

import { useCart } from "@/components/public/CartProvider";

export default function CartLink() {
  const { itemCount, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="col-start-3 row-start-1 inline-flex min-h-11 items-center justify-self-end rounded-full px-2 text-sm font-semibold md:text-base"
      aria-label={ready ? `Cart, ${itemCount} items` : "Cart"}
    >
      Cart{ready ? ` (${itemCount})` : ""}
    </Link>
  );
}
