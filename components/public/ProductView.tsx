"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import AddToCartButton from "@/components/public/AddToCartButton";
import MessageDialog from "@/components/public/MessageDialog";
import StickyMobileCartBar from "@/components/product/StickyMobileCartBar";
import WhatsAppOrderButton from "@/components/ui/WhatsAppOrderButton";
import type { ProductDetail } from "@/lib/data";

type ProductShade = ProductDetail["shades"][number];
type ImageViewer = typeof import("./ProductImageViewer").default;
type ShadeMenuPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

function lockPageScroll() {
  const root = document.documentElement;
  const previousOverflow = root.style.overflow;
  const previousPaddingRight = document.body.style.paddingRight;
  const scrollbarWidth = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    root.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  };
}

export default function ProductView({
  product,
}: {
  product: ProductDetail;
}) {
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(null);
  const [shadeMenuOpen, setShadeMenuOpen] = useState(false);
  const [shadeSheetOpen, setShadeSheetOpen] = useState(false);
  const [shadeMenuPosition, setShadeMenuPosition] =
    useState<ShadeMenuPosition | null>(null);
  const [dialogMessage, setDialogMessage] = useState("");
  const [ImageViewerComponent, setImageViewerComponent] =
    useState<ImageViewer | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const shadeSelectorRef = useRef<HTMLElement | null>(null);
  const shadeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const shadeReturnFocusRef = useRef<HTMLButtonElement | null>(null);
  const shadeSheetRef = useRef<HTMLDialogElement | null>(null);
  const shadeSheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const selectedShadeOptionRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMovedRef = useRef(false);
  const baseImage = product?.images?.[0]?.url ?? null;
  const mainImage = selectedShade?.image_url ?? baseImage;
  const galleryImages = [
    ...new Set([
      ...(mainImage ? [mainImage] : []),
      ...(product?.images ?? []).map((image) => image?.url).filter(Boolean),
    ]),
  ];
  const needsShade = (product?.shades?.length ?? 0) > 0;

  function chooseShade(shade: ProductShade) {
    if (!shade.is_available) {
      setDialogMessage(
        "Sorry, this shade is currently out of stock. Please choose another shade.",
      );
      return;
    }
    setSelectedShade(shade);
    if (shadeSheetRef.current?.open) dismissShadeSheet();
    else closeShadeMenu();
  }

  function openShadeMenu(button: HTMLButtonElement) {
    shadeReturnFocusRef.current = button;
    setShadeSheetOpen(window.matchMedia("(max-width: 767px)").matches);
    setShadeMenuOpen(true);
  }

  function closeShadeMenu() {
    setShadeMenuOpen(false);
    setShadeSheetOpen(false);
    shadeReturnFocusRef.current?.focus({ preventScroll: true });
  }

  function dismissShadeSheet() {
    shadeSheetRef.current?.close();
    closeShadeMenu();
  }

  useEffect(() => {
    const dialog = shadeSheetRef.current;
    if (!dialog) return;

    const mobile = window.matchMedia("(max-width: 767px)");
    if (!shadeMenuOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    function handleBreakpointChange() {
      closeShadeMenu();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        shadeSheetRef.current?.close();
        setShadeMenuOpen(false);
        setShadeSheetOpen(false);
        shadeReturnFocusRef.current?.focus({ preventScroll: true });
      }
    }

    mobile.addEventListener("change", handleBreakpointChange);
    if (shadeSheetOpen) {
      window.addEventListener("keydown", handleEscape, true);
    }
    if (!shadeSheetOpen) {
      return () => {
        mobile.removeEventListener("change", handleBreakpointChange);
      };
    }

    const unlockPageScroll = lockPageScroll();

    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => {
      shadeSheetCloseRef.current?.focus();
      selectedShadeOptionRef.current?.scrollIntoView({ block: "nearest" });
    });

    return () => {
      mobile.removeEventListener("change", handleBreakpointChange);
      window.removeEventListener("keydown", handleEscape, true);
      if (dialog.open) dialog.close();
      unlockPageScroll();
    };
  }, [shadeMenuOpen, shadeSheetOpen, selectedShade?.id]);

  useLayoutEffect(() => {
    if (!shadeMenuOpen || window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    function updatePosition() {
      const dropdownTrigger = shadeTriggerRef.current;
      if (!dropdownTrigger) return;
      const rect = dropdownTrigger.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const left = Math.max(8, Math.min(rect.left, viewportWidth - rect.width - 8));
      const headerBottom =
        document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const topLimit = Math.max(8, headerBottom + 8);
      const above = Math.max(0, rect.top - topLimit);
      const below = viewportHeight - rect.bottom - 8;
      const opensAbove = above > below;
      const maxHeight = Math.max(0, Math.max(above, below) - 4);

      setShadeMenuPosition({
        left,
        width: Math.min(rect.width, viewportWidth - 16),
        maxHeight,
        ...(opensAbove
          ? { bottom: viewportHeight - rect.top + 4 }
          : { top: Math.max(topLimit, rect.bottom + 4) }),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    window.visualViewport?.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
      window.visualViewport?.removeEventListener("scroll", updatePosition);
    };
  }, [shadeMenuOpen]);

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
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
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:text-emerald-700 hover:underline">
            Home
          </Link>
          <span>/</span>
          {product.category_slug ? (
            <>
              <Link
                href={`/categories/${product.category_slug}`}
                className="hover:text-emerald-700 hover:underline"
              >
                {product.category_name || "Category"}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="truncate text-gray-700 font-medium max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="w-full min-w-0">
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              {product.category_name}
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                product.in_stock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.in_stock ? "✓ In Stock" : "Out of Stock"}
            </span>
          </div>

          <h1 className="break-anywhere mt-2.5 text-xl sm:text-2xl md:text-3xl font-serif font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Star Rating snippet */}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div className="flex text-amber-400">
              {"★★★★★"}
            </div>
            <span className="font-bold text-gray-800">4.9</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 underline">128 verified reviews</span>
          </div>

          {/* Pricing Block */}
          {(product.price !== null || product.discount_price !== null) && (
            <div className="mt-3.5 flex flex-wrap items-baseline gap-2.5 rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
              <span className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">
                Rs. {(product.discount_price ?? product.price ?? 0).toLocaleString()}
              </span>
              {product.discount_price && product.price && product.discount_price < product.price && (
                <>
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                    SAVE {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>
          )}

          {/* Value Highlights */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white p-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>100% Original Sourced</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white p-2">
              <span className="text-emerald-600 font-bold">💬</span>
              <span>Direct WhatsApp Inquiry</span>
            </div>
          </div>

          {!product.in_stock ? (
            <p className="mt-2 text-sm font-semibold text-red-600">
              This product is currently out of stock.
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
            <button
              ref={shadeTriggerRef}
              type="button"
              className="shade-mobile-trigger field mt-3 flex items-center justify-between text-left"
              aria-haspopup="listbox"
              aria-expanded={shadeMenuOpen}
              onClick={(event) => {
                if (shadeMenuOpen) closeShadeMenu();
                else openShadeMenu(event.currentTarget);
              }}
            >
              <span className="flex min-w-0 items-center gap-2">
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
                <span className="shade-selector-label">
                  {selectedShade
                    ? `${selectedShade.code ? `${selectedShade.code} ` : ""}${selectedShade.name}`
                    : "Select a shade"}
                </span>
              </span>
              <span aria-hidden="true">{shadeMenuOpen ? "−" : "+"}</span>
            </button>

            {(product?.shades || []).length <= 8 ? (
              <div className="shade-desktop-options mt-3 flex flex-wrap gap-2">
                {(product?.shades || []).map((shade) => (
                  <button
                    key={shade.id}
                    type="button"
                    aria-pressed={selectedShade?.id === shade.id}
                    aria-disabled={!shade.is_available}
                    onClick={() => chooseShade(shade)}
                    className={`shade-pill inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-left text-sm font-semibold${shade.is_available ? "" : " cursor-not-allowed opacity-50"}`}
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
              <div className="shade-desktop-selector relative mt-3">
                <button
                  ref={shadeTriggerRef}
                  type="button"
                  className="field flex items-center justify-between text-left"
                  aria-haspopup="listbox"
                  aria-expanded={shadeMenuOpen}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && shadeMenuOpen) {
                      event.preventDefault();
                      closeShadeMenu();
                    }
                  }}
                  onClick={(event) => {
                    if (shadeMenuOpen) closeShadeMenu();
                    else openShadeMenu(event.currentTarget);
                  }}
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
                    <span className="shade-selector-label">
                      {selectedShade
                        ? `${selectedShade.code ? `${selectedShade.code} ` : ""}${selectedShade.name}`
                        : "Select a shade"}
                    </span>
                  </span>
                  <span aria-hidden="true">{shadeMenuOpen ? "−" : "+"}</span>
                </button>
                {shadeMenuOpen ? (
                  <div
                    className="shade-desktop-dropdown card fixed z-[1000] overflow-y-auto p-1"
                    role="listbox"
                    aria-label="Product shades"
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        closeShadeMenu();
                      }
                    }}
                    style={shadeMenuPosition ?? { visibility: "hidden" }}
                  >
                    {(product?.shades || []).map((shade) => (
                      <button
                        key={shade.id}
                        type="button"
                        role="option"
                        aria-selected={selectedShade?.id === shade.id}
                        aria-disabled={!shade.is_available}
                        onClick={() => chooseShade(shade)}
                        className={`shade-option flex min-h-12 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-linen${shade.is_available ? "" : " cursor-not-allowed opacity-50"}`}
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
                        <span className="shade-option-label">
                          {shade.code ? `${shade.code} ` : ""}
                          {shade.name}
                          {!shade.is_available ? " · Out of stock" : ""}
                        </span>
                        {selectedShade?.id === shade.id ? (
                          <span className="shade-option-check" aria-hidden="true">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <dialog
              ref={shadeSheetRef}
              className="shade-sheet-dialog"
              aria-labelledby="shade-sheet-heading"
              onClose={() => {
                closeShadeMenu();
              }}
              onCancel={(event) => {
                event.preventDefault();
                dismissShadeSheet();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  dismissShadeSheet();
                }
              }}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  dismissShadeSheet();
                }
              }}
            >
              <div className="shade-sheet-content">
                <div className="shade-sheet-header">
                  <h2 id="shade-sheet-heading" className="text-lg font-semibold">
                    Choose a shade
                  </h2>
                  <button
                    ref={shadeSheetCloseRef}
                    type="button"
                    className="shade-sheet-close"
                    aria-label="Close shade list"
                    onClick={dismissShadeSheet}
                  >
                    ×
                  </button>
                </div>
                <div
                  className="shade-sheet-list"
                  role="listbox"
                  aria-label="Product shades"
                >
                  {(product?.shades || []).map((shade) => (
                    <button
                      key={shade.id}
                      ref={
                        shadeMenuOpen && selectedShade?.id === shade.id
                          ? selectedShadeOptionRef
                          : null
                      }
                      type="button"
                      role="option"
                      aria-selected={selectedShade?.id === shade.id}
                      aria-disabled={!shade.is_available}
                      onClick={() => chooseShade(shade)}
                      className={`shade-option flex min-h-12 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold hover:bg-linen${shade.is_available ? "" : " cursor-not-allowed opacity-50"}`}
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
                      <span className="shade-option-label">
                        {shade.code ? `${shade.code} ` : ""}
                        {shade.name}
                        {!shade.is_available ? " · Out of stock" : ""}
                      </span>
                      {selectedShade?.id === shade.id ? (
                        <span className="shade-option-check" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </dialog>
          </section>
        ) : null}

        {product.description ? (
          <p className="leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {product.description}
          </p>
        ) : null}

        <div className="product-buy-bar flex flex-col gap-2.5">
          <WhatsAppOrderButton
            productTitle={product?.name}
            shadeName={selectedShade ? `${selectedShade.code ? `${selectedShade.code} ` : ""}${selectedShade.name}` : undefined}
            price={product?.price ? String(product.price) : undefined}
            label="ORDER ON WHATSAPP"
            className="w-full py-3.5 text-xs font-bold tracking-widest shadow-md"
          />
          <AddToCartButton
            product={{
              id: product?.id,
              slug: product?.slug,
              name: product?.name,
              photoUrl: baseImage,
              price: product?.discount_price ?? product?.price ?? null,
            }}
            shade={selectedShade
              ? {
                  id: selectedShade.id,
                  code: selectedShade.code,
                  name: selectedShade.name,
                  imageUrl: selectedShade.image_url,
                }
              : null}
            inStock={product?.in_stock ?? true}
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
    <StickyMobileCartBar
      product={product}
      selectedShade={selectedShade}
      onSelectShade={chooseShade}
      onMissingShade={() => {
        shadeSelectorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        shadeSelectorRef.current?.focus({ preventScroll: true });
      }}
    />
  </div>
);
}
