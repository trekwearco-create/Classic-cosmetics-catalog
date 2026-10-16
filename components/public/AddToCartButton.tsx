"use client";

import { useState } from "react";

import { useCart, type CartShade } from "@/components/public/CartProvider";
import MessageDialog from "@/components/public/MessageDialog";

export default function AddToCartButton({
  product,
  shade = null,
  inStock = true,
  available = true,
  requiresShade = false,
  onMissingShade,
  className = "btn-secondary w-full",
}: {
  product: { id: string; slug: string; name: string; photoUrl?: string | null };
  shade?: CartShade | null;
  inStock?: boolean;
  available?: boolean;
  requiresShade?: boolean;
  onMissingShade?: () => void;
  className?: string;
}) {
  const { addItem, storageError } = useCart();
  const [dialogMessage, setDialogMessage] = useState("");
  const needsShade = requiresShade && shade === null;
  const ariaDisabled = !inStock || !available || needsShade;

  return (
    <>
      <button
        type="button"
        className={`${className} purchase-button${ariaDisabled ? " is-muted" : ""}`}
        aria-disabled={ariaDisabled}
        onClick={() => {
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
          addItem(
            { ...product, photoUrl: product.photoUrl ?? null, shade },
            inStock,
            available,
          );
        }}
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
