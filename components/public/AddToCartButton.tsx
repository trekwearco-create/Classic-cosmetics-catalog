"use client";

import { useState } from "react";

import { useCart, type CartShade } from "@/components/public/CartProvider";

export default function AddToCartButton({
  product,
  shade = null,
  disabled = false,
  className = "btn-secondary w-full",
}: {
  product: { id: string; slug: string; name: string };
  shade?: CartShade | null;
  disabled?: boolean;
  className?: string;
}) {
  const { addItem, storageError } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => {
          addItem({ ...product, shade });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
      >
        {disabled ? "Out of stock" : added ? "Added to cart" : "Add to Cart"}
      </button>
      {storageError ? (
        <span className="sr-only" role="alert">{storageError}</span>
      ) : null}
    </>
  );
}
