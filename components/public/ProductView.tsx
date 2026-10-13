"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ProductDetail } from "@/lib/data";

type ProductShade = ProductDetail["shades"][number];

export default function ProductView({
  product,
  orderUrl,
  shadeOrderUrls,
}: {
  product: ProductDetail;
  orderUrl: string;
  shadeOrderUrls: Record<string, string>;
}) {
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(null);
  const [shadeMenuOpen, setShadeMenuOpen] = useState(false);
  const baseImage = product.images[0]?.url ?? null;
  const mainImage = selectedShade?.image_url ?? baseImage;
  const galleryImages = [
    ...new Set([
      ...(mainImage ? [mainImage] : []),
      ...product.images.map((image) => image.url),
    ]),
  ];
  const currentOrderUrl = selectedShade
    ? shadeOrderUrls[selectedShade.id] ?? orderUrl
    : orderUrl;
  const needsShade = product.shades.length > 0;
  const orderDisabled = needsShade && selectedShade === null;
  const orderLabel = orderDisabled
    ? "Select a shade first"
    : "Order on WhatsApp";

  function chooseShade(shade: ProductShade) {
    if (!shade.is_available) return;
    setSelectedShade(shade);
    setShadeMenuOpen(false);
  }

  return (
    <main className="product-detail-layout mt-4 pb-28 md:mt-8 md:pb-10">
      <div className="product-gallery" aria-label={`Images of ${product.name}`}>
        {galleryImages.length > 0 ? (
          <div className="product-gallery-track" key={mainImage ?? "empty"}>
            {galleryImages.map((url, index) => (
              <div className="product-gallery-slide" key={`${url}-${index}`}>
                <Image
                  src={url}
                  alt={`${product.name}${index ? `, image ${index + 1}` : ""}`}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  unoptimized
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-image-empty">No product images available</div>
        )}
      </div>

      <div className="product-detail-copy">
        <div>
          {product.category_slug ? (
            <Link
              className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
              href={`/categories/${product.category_slug}`}
            >
              {product.category_name || "Products"}
            </Link>
          ) : null}
          <h1 className="mt-2 text-3xl leading-tight md:text-4xl">
            {product.name}
          </h1>
        </div>

        {needsShade ? (
          <section className="card w-full p-4" aria-labelledby="shade-heading">
            <h2 id="shade-heading" className="text-sm font-semibold">
              Choose a shade
            </h2>
            {selectedShade ? (
              <p className="mt-2 text-sm font-semibold" aria-live="polite">
                Selected shade: {selectedShade.code ? `${selectedShade.code} ` : ""}
                {selectedShade.name}
              </p>
            ) : null}
            {product.shades.length <= 8 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {product.shades.map((shade) => (
                  <button
                    key={shade.id}
                    type="button"
                    aria-pressed={selectedShade?.id === shade.id}
                    disabled={!shade.is_available}
                    onClick={() => chooseShade(shade)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor:
                        selectedShade?.id === shade.id
                          ? "var(--bronze)"
                          : "var(--line)",
                      background: "var(--white)",
                    }}
                  >
                    {shade.color_hex ? (
                      <span
                        className="h-5 w-5 rounded-full border"
                        style={{
                          background: shade.color_hex,
                          borderColor: "var(--line)",
                        }}
                        aria-hidden="true"
                      />
                    ) : shade.image_url ? (
                      <span className="relative h-6 w-6 overflow-hidden rounded-full border">
                        <Image
                          src={shade.image_url}
                          alt=""
                          fill
                          unoptimized
                          sizes="24px"
                          className="object-cover"
                        />
                      </span>
                    ) : null}
                    {shade.code ? `${shade.code} ` : ""}
                    {shade.name}
                    {!shade.is_available ? " · Unavailable" : ""}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative mt-3">
                <button
                  type="button"
                  className="field flex items-center justify-between text-left"
                  aria-haspopup="listbox"
                  aria-expanded={shadeMenuOpen}
                  onClick={() => setShadeMenuOpen((open) => !open)}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    {selectedShade?.color_hex ? (
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border"
                        style={{
                          background: selectedShade.color_hex,
                          borderColor: "var(--line)",
                        }}
                        aria-hidden="true"
                      />
                    ) : null}
                    {selectedShade
                      ? `${selectedShade.code ? `${selectedShade.code} ` : ""}${selectedShade.name}`
                      : "Select a shade"}
                  </span>
                  <span aria-hidden="true">{shadeMenuOpen ? "−" : "+"}</span>
                </button>
                {shadeMenuOpen ? (
                  <div
                    className="card absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto p-1"
                    role="listbox"
                    aria-label="Product shades"
                  >
                    {product.shades.map((shade) => (
                      <button
                        key={shade.id}
                        type="button"
                        role="option"
                        aria-selected={selectedShade?.id === shade.id}
                        disabled={!shade.is_available}
                        onClick={() => chooseShade(shade)}
                        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-linen disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {shade.color_hex ? (
                          <span
                            className="h-5 w-5 shrink-0 rounded-full border"
                            style={{
                              background: shade.color_hex,
                              borderColor: "var(--line)",
                            }}
                            aria-hidden="true"
                          />
                        ) : null}
                        <span>
                          {shade.code ? `${shade.code} ` : ""}
                          {shade.name}
                          {!shade.is_available ? " · Unavailable" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        ) : null}

        {!product.in_stock ? (
          <p className="badge-out w-fit">Out of stock</p>
        ) : null}
        {product.description ? (
          <p className="leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {product.description}
          </p>
        ) : null}

        {orderDisabled ? (
          <button
            className="btn-primary hidden w-full md:inline-flex"
            type="button"
            disabled
          >
            {orderLabel}
          </button>
        ) : (
          <a
            href={currentOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary hidden w-full md:inline-flex"
            aria-label={`Order ${product.name}${selectedShade ? ` in ${selectedShade.name}` : ""} on WhatsApp`}
          >
            {orderLabel}
          </a>
        )}
      </div>

      <div className="mobile-buy-bar md:hidden">
        {orderDisabled ? (
          <button className="btn-primary w-full" type="button" disabled>
            {orderLabel}
          </button>
        ) : (
          <a
            href={currentOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full"
            aria-label={`Order ${product.name}${selectedShade ? ` in ${selectedShade.name}` : ""} on WhatsApp`}
          >
            {orderLabel}
          </a>
        )}
      </div>
    </main>
  );
}
