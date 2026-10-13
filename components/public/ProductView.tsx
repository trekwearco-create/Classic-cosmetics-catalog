"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ProductDetail } from "@/lib/data";
import { formatMoney } from "@/lib/price";

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
  const initialShade =
    product.shades.find((shade) => shade.is_available) ?? null;
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(
    initialShade,
  );
  const baseImage = product.images[0]?.url ?? null;
  const mainImage = selectedShade?.image_url ?? baseImage;
  const galleryImages = [
    ...new Set([
      ...(mainImage ? [mainImage] : []),
      ...product.images.map((image) => image.url),
    ]),
  ];
  const price = product.discount_price ?? product.price;
  const percent =
    product.discount_price !== null && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;
  const currentOrderUrl = selectedShade
    ? shadeOrderUrls[selectedShade.id] ?? orderUrl
    : orderUrl;

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
          <h1 className="mt-2 text-3xl leading-tight md:text-4xl">{product.name}</h1>
          {selectedShade ? (
            <p className="mt-2 text-sm font-semibold" aria-live="polite">
              Selected shade: {selectedShade.code ? `${selectedShade.code} ` : ""}
              {selectedShade.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-2xl font-bold">{formatMoney(price)}</p>
          {percent > 0 ? (
            <>
              <s className="text-base" style={{ color: "var(--ink-2)" }}>
                {formatMoney(product.price)}
              </s>
              <span className="badge-off">{percent}% OFF</span>
            </>
          ) : null}
        </div>

        {!product.in_stock ? <p className="badge-out w-fit">Out of stock</p> : null}
        {product.description ? (
          <p className="leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {product.description}
          </p>
        ) : null}

        {product.shades.length > 0 ? (
          <section className="card w-full p-4" aria-labelledby="shade-heading">
            <h2 id="shade-heading" className="text-sm font-semibold">
              Choose a shade
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.shades.map((shade) => (
                <button
                  key={shade.id}
                  type="button"
                  aria-pressed={selectedShade?.id === shade.id}
                  disabled={!shade.is_available}
                  onClick={() => setSelectedShade(shade)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor:
                      selectedShade?.id === shade.id ? "var(--ink)" : "var(--line)",
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
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <a
          href={currentOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary hidden w-full md:inline-flex"
          aria-label={`Order ${product.name}${selectedShade ? ` in ${selectedShade.name}` : ""} on WhatsApp`}
        >
          Order on WhatsApp
        </a>
      </div>

      <div className="mobile-buy-bar md:hidden">
        <a
          href={currentOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full"
          aria-label={`Order ${product.name}${selectedShade ? ` in ${selectedShade.name}` : ""} on WhatsApp`}
        >
          Order on WhatsApp · {formatMoney(price)}
        </a>
      </div>
    </main>
  );
}
