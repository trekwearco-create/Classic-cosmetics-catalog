"use client";

import { useState } from "react";

import { useCart, type CartShade } from "@/components/public/CartProvider";
import MessageDialog from "@/components/public/MessageDialog";

function IconBag() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 8.5h14v12H5z" />
      <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AddToCartButton({
  product,
  shade = null,
  inStock = true,
  available = true,
  requiresShade = false,
  onMissingShade,
  className = "btn-secondary w-full",
  iconOnly = false,
}: {
  product: { id: string; slug: string; name: string; photoUrl?: string | null };
  shade?: CartShade | null;
  inStock?: boolean;
  available?: boolean;
  requiresShade?: boolean;
  onMissingShade?: () => void;
  className?: string;
  /** Renders as a round bag icon button (used on product cards) */
  iconOnly?: boolean;
}) {
  const { addItem, storageError } = useCart();
  const [dialogMessage, setDialogMessage] = useState("");
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const needsShade = requiresShade && shade === null;
  const ariaDisabled = !inStock || !available || needsShade;

  function handleClick() {
    if (loading) return;
    if (!inStock) {
      setDialogMessage(
        "Sorry, this product is currently out of stock and cannot be ordered.",
      );
      return;
    }
    if (!available) {
      setDialogMessage(
        "Sorry, this shade is currently out of stock. Please choose another shade.",
      );
      return;
    }
    if (needsShade) {
      onMissingShade?.();
      return;
    }

    setLoading(true);
    try {
      const ok = addItem(
        { ...product, photoUrl: product.photoUrl ?? null, shade },
        inStock,
        available,
      );
      if (ok && iconOnly) {
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }

  if (iconOnly) {
    return (
      <>
        <button
          type="button"
          className="product-card-bag-btn relative overflow-hidden transition-all duration-300"
          aria-label={`Add ${product.name} to cart`}
          aria-disabled={ariaDisabled}
          disabled={loading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClick();
          }}
        >
          {loading ? (
            <div className="relative flex h-4 w-4 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-300 animate-[ping_1.0s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></div>
              <div className="h-4 w-4 rounded-full border border-emerald-100"></div>
              <div className="absolute h-4 w-4 rounded-full border-[1.5px] border-transparent border-t-[#0c3b25] border-r-[#0c3b25] animate-[spin_1.0s_linear_infinite]"></div>
            </div>
          ) : added ? (
            <IconCheck />
          ) : (
            <IconBag />
          )}
        </button>
        <MessageDialog
          open={dialogMessage !== ""}
          title="Out of stock"
          message={dialogMessage}
          onDismiss={() => setDialogMessage("")}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#0c3b25] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-300 ease-out ${
          loading
            ? "bg-white text-transparent cursor-not-allowed shadow-none"
            : ariaDisabled
            ? "opacity-60 cursor-not-allowed bg-gray-200 text-gray-500 border-gray-300"
            : "bg-[#0c3b25] text-white hover:bg-white hover:text-[#0c3b25] shadow-sm active:scale-[0.98]"
        } ${className}`}
        aria-disabled={ariaDisabled}
        onClick={handleClick}
        disabled={loading}
      >
        <span className="absolute inset-0 h-full w-full bg-white transition-transform duration-300 ease-out -translate-y-full group-hover:translate-y-0 -z-0"></span>
        <span className="relative z-10 font-serif transition-colors duration-300">
          {inStock && available && needsShade
            ? "Select your shade first"
            : "Add to cart"}
        </span>
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-300 animate-[ping_1.0s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></div>
              <div className="h-5 w-5 rounded-full border border-emerald-100"></div>
              <div className="absolute h-5 w-5 rounded-full border-[1.5px] border-transparent border-t-[#0c3b25] border-r-[#0c3b25] animate-[spin_1.0s_linear_infinite]"></div>
              <div className="h-1 w-1 rounded-full bg-[#0c3b25]"></div>
            </div>
          </div>
        )}
      </button>
      {storageError ? (
        <span className="sr-only" role="alert">{storageError}</span>
      ) : null}
      <MessageDialog
        open={dialogMessage !== ""}
        title="Out of stock"
        message={dialogMessage}
        onDismiss={() => setDialogMessage("")}
      />
    </>
  );
}
