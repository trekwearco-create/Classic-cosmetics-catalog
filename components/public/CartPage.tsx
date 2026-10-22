"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import CartThumbnail from "@/components/public/CartThumbnail";
import MessageDialog from "@/components/public/MessageDialog";
import {
  useCart,
  type CartItem,
} from "@/components/public/CartProvider";

type VerifiedCartLine = {
  id: string;
  shadeId: string | null;
  name: string | null;
  slug: string | null;
  inStock: boolean;
  available: boolean;
  photoUrl: string | null;
  shade: CartItem["shade"];
};

type CartValidationResponse = { lines: VerifiedCartLine[] };

function lineKey(id: string, shadeId: string | null) {
  return `${id}:${shadeId ?? ""}`;
}

export default function CartPage({
  whatsappNumber,
  siteUrl,
}: {
  whatsappNumber: string;
  siteUrl: string;
}) {
  const {
    items,
    ready,
    storageError,
    setQuantity,
    removeItem,
    replaceItems,
  } = useCart();
  const [formError, setFormError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [checking, setChecking] = useState(false);
  const [outOfStockNames, setOutOfStockNames] = useState<string[]>([]);
  const [outOfStockDialogOpen, setOutOfStockDialogOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([]);
  const confirmationRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = confirmationRef.current;
    if (!dialog) return;
    if (confirmationOpen && !dialog.open) dialog.showModal();
    if (!confirmationOpen && dialog.open) dialog.close();
  }, [confirmationOpen]);

  function closeConfirmation() {
    setConfirmationOpen(false);
    requestAnimationFrame(() => confirmButtonRef.current?.focus());
  }

  async function confirmOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (checking || !items.length) return;

    const name = customerName.trim();
    const phone = customerPhone.trim();
    if (name.length < 2 || name.length > 100) {
      setFormError("Enter your name (2–100 characters).");
      return;
    }
    if (!/^[+\d][\d\s()-]{5,24}$/.test(phone) || phone.replace(/\D/g, "").length < 7) {
      setFormError("Enter a valid phone number.");
      return;
    }

    setChecking(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          lines: items.map((item) => ({
            id: item.id,
            shadeId: item.shade?.id ?? null,
          })),
        }),
      });
      if (!response.ok) {
        setFormError("We could not verify your cart. Please try again.");
        return;
      }

      const validation =
        (await response.json()) as CartValidationResponse;
      const verifiedByKey = new Map(
        validation.lines.map((line) => [
          lineKey(line.id, line.shadeId),
          line,
        ]),
      );
      const availableItems: CartItem[] = [];
      const unavailableNames: string[] = [];

      for (const item of items) {
        const verified = verifiedByKey.get(
          lineKey(item.id, item.shade?.id ?? null),
        );
        if (!verified) {
          setFormError("We could not verify your cart. Please try again.");
          return;
        }
        if (!verified.inStock || !verified.available) {
          const productName = verified.name ?? item.name;
          const shadeName = verified.shade?.name ?? item.shade?.name;
          unavailableNames.push(
            shadeName ? `${productName} — ${shadeName}` : productName,
          );
          continue;
        }
        availableItems.push({
          ...item,
          name: verified.name ?? item.name,
          slug: verified.slug ?? item.slug,
          photoUrl: verified.photoUrl ?? item.photoUrl,
          shade: item.shade
            ? verified.shade ?? item.shade
            : null,
        });
      }

      replaceItems(availableItems);
      if (unavailableNames.length) {
        setOutOfStockNames(unavailableNames);
        setOutOfStockDialogOpen(true);
        return;
      }
      if (!availableItems.length) {
        setFormError("Add an in-stock item before confirming your order.");
        return;
      }

      setConfirmedItems(availableItems);
      setConfirmationOpen(true);
    } catch {
      setFormError("We could not verify your cart. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  function orderOnWhatsApp() {
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const address = customerAddress.trim();
    const lines = [
      "Assalam o Alaikum, I would like to place an order:",
      "",
      ...confirmedItems.flatMap((item, index) => [
        `${index + 1}. ${item.name}`,
        ...(item.shade
          ? [
              `   Shade: ${item.shade.code ? `${item.shade.code} ` : ""}${item.shade.name}`,
            ]
          : []),
        `   Quantity: ${item.quantity}`,
        `   Product: ${new URL(`/product/${encodeURIComponent(item.slug)}`, siteUrl).toString()}`,
      ]),
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      ...(address ? [`Address: ${address}`] : []),
    ];
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const confirmedItemCount = confirmedItems.reduce(
    (count, item) => count + item.quantity,
    0,
  );

  if (!ready) {
    return (
      <main className="mx-auto w-full max-w-full py-12">
        <p>Loading your cart…</p>
      </main>
    );
  }

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="mx-auto w-full max-w-full py-6 md:py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <Link href="/" className="hover:text-emerald-700 hover:underline">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">Shopping Cart</span>
      </nav>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl" style={{ fontFamily: "var(--font-display, serif)" }}>
          Your Cart
        </h1>
        {items.length > 0 && (
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
            {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <span>🚚</span>
            <span>Fast Nationwide Delivery (24 to 72 Hours)</span>
          </div>
          <p className="mt-1 text-emerald-700">
            Orders across Pakistan are packaged securely in temperature-regulated beauty boxes.
          </p>
        </div>
      )}

      {storageError ? (
        <p
          className="mt-4 rounded-xl border border-brick p-3 text-sm"
          role="alert"
        >
          {storageError}
        </p>
      ) : null}
      {items.length === 0 ? (
        <div className="card mt-6 p-6 text-center md:p-10">
          <p className="text-lg font-semibold">Your cart is empty.</p>
          <p className="mt-2 text-sm text-gray-500">
            Explore our curated catalog of authentic skincare, makeup, and perfumes.
          </p>
          <Link href="/" className="btn-primary mt-5">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">

          <section aria-label="Cart items" className="flex min-w-0 flex-col gap-3">
            {items.map((item) => (
              <article
                key={`${item.id}:${item.shade?.id ?? ""}`}
                className="card box-border grid w-full min-w-0 grid-cols-[88px_minmax(0,1fr)] gap-4 p-3 md:grid-cols-[96px_minmax(0,1fr)]"
              >
                <Link
                  href={`/product/${encodeURIComponent(item.slug)}`}
                  className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl md:h-24 md:w-24"
                  aria-label={`View ${item.name}`}
                >
                  <CartThumbnail
                    photoUrl={item.shade?.imageUrl ?? item.photoUrl}
                  />
                </Link>
                <div className="min-w-0">
                  <h2 className="cart-item-name text-base font-bold">{item.name}</h2>
                  {item.shade ? (
                    <p className="min-w-0 break-words text-sm" style={{ color: "var(--ink-2)" }}>
                      Shade: {item.shade.code ? `${item.shade.code} ` : ""}
                      {item.shade.name}
                    </p>
                  ) : null}
                  <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary min-h-10 px-3"
                      onClick={() =>
                        setQuantity(
                          item.id,
                          item.shade?.id ?? null,
                          item.quantity - 1,
                        )
                      }
                      disabled={checking || item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span
                      className="min-w-8 text-center"
                      aria-label={`Quantity ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary min-h-10 px-3"
                      onClick={() =>
                        setQuantity(
                          item.id,
                          item.shade?.id ?? null,
                          item.quantity + 1,
                        )
                      }
                      disabled={checking || item.quantity >= 99}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn-danger ml-auto min-w-0"
                      onClick={() =>
                        removeItem(item.id, item.shade?.id ?? null)
                      }
                      disabled={checking}
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <form
            className="card box-border flex h-fit w-full min-w-0 flex-col gap-4 p-4 md:p-5"
            onSubmit={confirmOrder}
          >
            <h2 className="text-xl">Checkout</h2>
            <label
              className="flex min-w-0 flex-col gap-1 text-sm font-semibold"
              htmlFor="customer-name"
            >
              Name
              <input
                id="customer-name"
                className="field"
                name="customer-name"
                autoComplete="name"
                maxLength={100}
                required
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </label>
            <label
              className="flex min-w-0 flex-col gap-1 text-sm font-semibold"
              htmlFor="customer-phone"
            >
              Phone
              <input
                id="customer-phone"
                className="field"
                name="customer-phone"
                type="tel"
                autoComplete="tel"
                maxLength={25}
                required
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
              />
            </label>
            <label
              className="flex min-w-0 flex-col gap-1 text-sm font-semibold"
              htmlFor="customer-address"
            >
              Address <span className="font-normal">(optional)</span>
              <textarea
                id="customer-address"
                className="field min-h-24 py-3"
                name="customer-address"
                autoComplete="street-address"
                maxLength={300}
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
              />
            </label>
            {formError ? (
              <p className="text-sm font-semibold text-brick" role="alert">
                {formError}
              </p>
            ) : null}
            <button
              ref={confirmButtonRef}
              type="submit"
              className="btn-primary w-full"
              disabled={checking}
            >
              {checking ? "Checking availability…" : "Confirm order"}
            </button>

            <div className="mt-2 flex flex-col gap-1.5 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>100% Genuine, Authenticity Guaranteed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">⚡</span>
                <span>Safe Cash on Delivery & Express Dispatch</span>
              </div>
            </div>
          </form>
        </div>
      )}

      <MessageDialog
        open={outOfStockDialogOpen}
        title="Out of stock"
        message={[
          "These items were removed because they are out of stock. Please review your cart and confirm again:",
          ...outOfStockNames.map((name) => `• ${name}`),
        ].join("\n")}
        onDismiss={() => {
          setOutOfStockDialogOpen(false);
          setOutOfStockNames([]);
        }}
      />

      <dialog
        ref={confirmationRef}
        className="cart-confirmation-dialog"
        aria-labelledby="cart-confirmation-title"
        onClose={closeConfirmation}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            confirmationRef.current?.close();
          }
        }}
      >
        <h2 id="cart-confirmation-title" className="text-3xl">
          Almost done
        </h2>
        <p className="mt-4 leading-relaxed">
          Your order is ready. Tap Order on WhatsApp to send it to us. We will
          confirm it with you there.
        </p>
        <p className="mt-3 font-semibold">
          {confirmedItemCount} {confirmedItemCount === 1 ? "item" : "items"}
        </p>
        <button
          type="button"
          className="btn-primary mt-6 w-full"
          onClick={orderOnWhatsApp}
        >
          Order on WhatsApp
        </button>
        <button
          type="button"
          className="mt-2 min-h-11 w-full font-semibold underline underline-offset-4"
          onClick={() => confirmationRef.current?.close()}
        >
          Back to checkout
        </button>
      </dialog>
    </main>
  );
}
