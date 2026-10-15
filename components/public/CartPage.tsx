"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/public/CartProvider";

export default function CartPage({
  whatsappNumber,
  siteUrl,
}: {
  whatsappNumber: string;
  siteUrl: string;
}) {
  const { items, ready, storageError, setQuantity, removeItem } = useCart();
  const [formError, setFormError] = useState("");

  function orderOnWhatsApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!items.length) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("customer-name") ?? "").trim();
    const phone = String(form.get("customer-phone") ?? "").trim();
    const address = String(form.get("customer-address") ?? "").trim();
    if (name.length < 2 || name.length > 100) {
      setFormError("Enter your name (2–100 characters).");
      return;
    }
    if (!/^[+\d][\d\s()-]{5,24}$/.test(phone) || phone.replace(/\D/g, "").length < 7) {
      setFormError("Enter a valid phone number.");
      return;
    }

    const lines = [
      "Assalam o Alaikum, I would like to place an order:",
      "",
      ...items.flatMap((item, index) => [
        `${index + 1}. ${item.name}`,
        ...(item.shade
          ? [`   Shade: ${item.shade.code ? `${item.shade.code} ` : ""}${item.shade.name}`]
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

  if (!ready) {
    return <main className="mx-auto max-w-3xl py-12"><p>Loading your cart…</p></main>;
  }

  return (
    <main className="mx-auto max-w-4xl py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl">Your Cart</h1>
      {storageError ? (
        <p className="mt-4 rounded-xl border border-brick p-3 text-sm" role="alert">{storageError}</p>
      ) : null}
      {items.length === 0 ? (
        <div className="card mt-6 p-6 text-center md:p-10">
          <p className="text-lg font-semibold">Your cart is empty.</p>
          <Link href="/" className="btn-primary mt-5">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <section aria-label="Cart items" className="flex flex-col gap-3">
            {items.map((item) => (
              <article key={`${item.id}:${item.shade?.id ?? ""}`} className="card flex gap-4 p-3">
                <Link
                  href={`/product/${encodeURIComponent(item.slug)}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-linen"
                  aria-label={`View ${item.name}`}
                >
                  <Image
                    src={`/product/${encodeURIComponent(item.slug)}/og`}
                    alt=""
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-contain"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold">{item.name}</h2>
                  {item.shade ? (
                    <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                      Shade: {item.shade.code ? `${item.shade.code} ` : ""}{item.shade.name}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary min-h-10 px-3"
                      onClick={() => setQuantity(item.id, item.shade?.id ?? null, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >−</button>
                    <span className="min-w-8 text-center" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                    <button
                      type="button"
                      className="btn-secondary min-h-10 px-3"
                      onClick={() => setQuantity(item.id, item.shade?.id ?? null, item.quantity + 1)}
                      disabled={item.quantity >= 99}
                      aria-label={`Increase quantity of ${item.name}`}
                    >+</button>
                    <button
                      type="button"
                      className="btn-danger ml-auto"
                      onClick={() => removeItem(item.id, item.shade?.id ?? null)}
                      aria-label={`Remove ${item.name}`}
                    >Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <form className="card flex h-fit flex-col gap-4 p-4 md:p-5" onSubmit={orderOnWhatsApp}>
            <h2 className="text-xl">Checkout</h2>
            <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="customer-name">
              Name
              <input id="customer-name" className="field" name="customer-name" autoComplete="name" maxLength={100} required />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="customer-phone">
              Phone
              <input id="customer-phone" className="field" name="customer-phone" type="tel" autoComplete="tel" maxLength={25} required />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="customer-address">
              Address <span className="font-normal">(optional)</span>
              <textarea id="customer-address" className="field min-h-24 py-3" name="customer-address" autoComplete="street-address" maxLength={300} />
            </label>
            {formError ? <p className="text-sm font-semibold text-brick" role="alert">{formError}</p> : null}
            <button type="submit" className="btn-primary w-full">Order on WhatsApp</button>
          </form>
        </div>
      )}
    </main>
  );
}
