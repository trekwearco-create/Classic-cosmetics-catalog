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
  const needsShade = requiresShade && shade === null;
  const ariaDisabled = !inStock || !available || needsShade;

  function handleClick() {
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
    const ok = addItem(
      { ...product, photoUrl: product.photoUrl ?? null, shade },
      inStock,
      available,
    );
    if (ok && iconOnly) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    }
  }

  if (iconOnly) {
    return (
      <>
        <button
          type="button"
          className="product-card-bag-btn"
          aria-label={`Add ${product.name} to cart`}
          aria-disabled={ariaDisabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClick();
          }}
        >
          {added ? <IconCheck /> : <IconBag />}
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
        className={`${className} purchase-button${ariaDisabled ? " is-muted" : ""}`}
        aria-disabled={ariaDisabled}
        onClick={handleClick}
      >
        {inStock && available && needsShade
          ? "Select your shade first"
          : "Add to cart"}
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
