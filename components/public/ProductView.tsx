"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import AddToCartButton from "@/components/public/AddToCartButton";
import MessageDialog from "@/components/public/MessageDialog";
import type { ProductDetail } from "@/lib/data";

type ProductShade = ProductDetail["shades"][number];
type ImageViewer = typeof import("./ProductImageViewer").default;

export default function ProductView({
  product,
}: {
  product: ProductDetail;
}) {
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(null);
  const [shadeMenuOpen, setShadeMenuOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [ImageViewerComponent, setImageViewerComponent] =
    useState<ImageViewer | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const shadeSelectorRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);
  const baseImage = product.images[0]?.url ?? null;
  const mainImage = selectedShade?.image_url ?? baseImage;
  const galleryImages = [
    ...new Set([
      ...(mainImage ? [mainImage] : []),
      ...product.images.map((image) => image.url),
    ]),
  ];
  const needsShade = product.shades.length > 0;

  function chooseShade(shade: ProductShade) {
    if (!shade.is_available) {
      setDialogMessage(
        "Sorry, this shade is currently out of stock. Please choose another shade.",
      );
      return;
    }
    setSelectedShade(shade);
    setShadeMenuOpen(false);
  }

  async function openViewer(
    index: number,
    trigger: HTMLButtonElement,
  ) {
    triggerRef.current = trigger;
    const { default: Viewer } = await import("./ProductImageViewer");
    setImageViewerComponent(() => Viewer);
    setViewerIndex(index);
  }

  function closeViewer() {
    setViewerIndex(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <main className="product-detail-layout mt-4 pb-36 md:mt-8 md:pb-10">
      <div className="product-gallery" aria-label={`Images of ${product.name}`}>
        {galleryImages.length > 0 ? (
          <div className="product-gallery-track" key={mainImage ?? "empty"}>
            {galleryImages.map((url, index) => (
              <div className="product-gallery-slide" key={`${url}-${index}`}>
                <button
                  ref={index === 0 ? triggerRef : undefined}
                  type="button"
                  className="product-photo-trigger"
                  aria-label="Open photo in full screen"
                  onPointerDown={(event) => {
                    pointerStartRef.current = {
                      x: event.clientX,
                      y: event.clientY,
                    };
                    pointerMovedRef.current = false;
                  }}
                  onPointerMove={(event) => {
                    const start = pointerStartRef.current;
                    if (
                      start &&
                      (Math.abs(event.clientX - start.x) >= 8 ||
                        Math.abs(event.clientY - start.y) >= 8)
                    ) {
                      pointerMovedRef.current = true;
                    }
                  }}
                  onPointerCancel={() => {
                    pointerMovedRef.current = true;
                  }}
                  onClick={(event) => {
                    if (pointerMovedRef.current && event.detail !== 0) {
                      event.preventDefault();
                      pointerMovedRef.current = false;
                      return;
                    }
                    pointerMovedRef.current = false;
                    void openViewer(index, event.currentTarget);
                  }}
                >
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
                </button>
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
          {!product.in_stock ? (
            <p className="mt-2 text-sm font-semibold text-brick">
              This product is out of stock.
            </p>
          ) : null}
        </div>

        {needsShade ? (
          <section
            ref={shadeSelectorRef}
            className="card w-full p-4"
            aria-labelledby="shade-heading"
            tabIndex={-1}
          >
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
                    aria-disabled={!shade.is_available}
                    onClick={() => chooseShade(shade)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold${shade.is_available ? "" : " cursor-not-allowed opacity-50"}`}
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
                    {!shade.is_available ? " · Out of stock" : ""}
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
                        aria-disabled={!shade.is_available}
                        onClick={() => chooseShade(shade)}
                        className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-linen${shade.is_available ? "" : " cursor-not-allowed opacity-50"}`}
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
                          {!shade.is_available ? " · Out of stock" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        ) : null}

        {product.description ? (
          <p className="leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {product.description}
          </p>
        ) : null}

        <div className="product-buy-bar">
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              photoUrl: baseImage,
            }}
            shade={selectedShade
              ? {
                  id: selectedShade.id,
                  code: selectedShade.code,
                  name: selectedShade.name,
                  imageUrl: selectedShade.image_url,
                }
              : null}
            inStock={product.in_stock}
              available={selectedShade?.is_available ?? true}
              requiresShade={needsShade}
            onMissingShade={() => {
              shadeSelectorRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              shadeSelectorRef.current?.focus({ preventScroll: true });
            }}
            className="btn-secondary w-full"
          />
        </div>
      </div>
      {viewerIndex !== null && ImageViewerComponent ? (
        <ImageViewerComponent
          images={galleryImages.map((src, index) => ({
            src,
            alt: `${product.name}${index ? `, image ${index + 1}` : ""}`,
          }))}
          initialIndex={viewerIndex}
          onClose={closeViewer}
        />
      ) : null}

      <MessageDialog
        open={dialogMessage !== ""}
        title="Out of stock"
        message={dialogMessage}
        onDismiss={() => setDialogMessage("")}
      />
    </main>
  );
}
