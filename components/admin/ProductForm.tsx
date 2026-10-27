"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import ImageUploader, { type UploadItem } from "@/components/admin/ImageUploader";
import ShadeEditor, { type ShadeRow } from "@/components/admin/ShadeEditor";
import {
  deleteProductAction,
  saveProductAction,
} from "@/lib/actions/products";
import { notifyCatalogChanged } from "@/lib/catalog-sync";

type CategoryOption = { id: string; name: string; parent_id?: string | null };
type BrandOption = { id: string; name: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price?: number | null;
  discount_price?: number | null;
  is_visible: boolean;
  in_stock: boolean;
  category_id: string;
  category_ids?: string[];
  brand_id?: string | null;
  images: UploadItem[];
  shades: ShadeRow[];
};

export default function ProductForm({
  categories,
  brands = [],
  initial,
  isNew,
}: {
  categories: CategoryOption[];
  brands?: BrandOption[];
  initial: ProductFormInitial;
  isNew: boolean;
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(initial.name);
  const [selectedBrandId, setSelectedBrandId] = useState(initial.brand_id ?? "");

  // Multi-Category selection
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    if (initial.category_ids && initial.category_ids.length > 0) {
      return initial.category_ids;
    }
    return initial.category_id ? [initial.category_id] : [];
  });

  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState<string>(
    initial.price !== null && initial.price !== undefined ? String(initial.price) : "",
  );
  const [discountPrice, setDiscountPrice] = useState<string>(
    initial.discount_price !== null && initial.discount_price !== undefined
      ? String(initial.discount_price)
      : "",
  );
  const [isVisible, setIsVisible] = useState(initial.is_visible);
  const [inStock, setInStock] = useState(initial.in_stock);
  const [images, setImages] = useState<UploadItem[]>(initial.images);
  const [shades, setShades] = useState<ShadeRow[]>(initial.shades);
  const [pendingShadeInput, setPendingShadeInput] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: initial.name,
        categoryIds:
          initial.category_ids && initial.category_ids.length > 0
            ? initial.category_ids
            : initial.category_id
              ? [initial.category_id]
              : [],
        description: initial.description,
        price: initial.price,
        discount_price: initial.discount_price,
        is_visible: initial.is_visible,
        in_stock: initial.in_stock,
        images: initial.images.map((i) => i.path),
        shades: initial.shades,
      }),
    [initial],
  );

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        name,
        categoryIds: selectedCategoryIds,
        description,
        price,
        discountPrice,
        is_visible: isVisible,
        in_stock: inStock,
        images: images.filter((i) => i.progress === "done").map((i) => i.path),
        shades,
      }),
    [name, selectedCategoryIds, description, price, discountPrice, isVisible, inStock, images, shades],
  );

  const dirty = currentSnapshot !== initialSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function handleSubmit() {
    setFormError(null);
    if (name.trim().length < 2) {
      setFormError("Fill in the product name (minimum 2 characters).");
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setFormError("Please select at least one category.");
      return;
    }
    if (pendingShadeInput) {
      setFormError("Click Add these shades before saving, or clear the pending shade list.");
      return;
    }
    if (shades.some((shade) => shade.name.trim() === "" && (shade.code.trim() !== "" || shade.color_hex !== "" || shade.image !== null))) {
      setFormError("Add a name for each shade, or remove its blank row.");
      return;
    }
    if (images.some((i) => i.progress !== "done")) {
      setFormError("Wait for the photos to finish uploading, then save.");
      return;
    }
    if (shades.some((shade) => shade.image && shade.image.progress !== "done")) {
      setFormError("Wait for shade photo uploads to finish, then save.");
      return;
    }
    const primaryCategoryId = selectedCategoryIds[0] || null;
    const fd = new FormData();
    fd.set(
      "payload",
      JSON.stringify({
        id: initial.id,
        name: name.trim(),
        category_id: primaryCategoryId,
        category_ids: selectedCategoryIds,
        brand_id: selectedBrandId ? selectedBrandId : null,
        description: description.trim() === "" ? null : description.trim(),
        price: price.trim() === "" ? null : Number(price),
        discount_price: discountPrice.trim() === "" ? null : Number(discountPrice),
        is_visible: isVisible,
        in_stock: inStock,
      }),
    );
    fd.set(
      "images",
      JSON.stringify(
        images.map((i, idx) => ({ url: i.url, path: i.path, is_cover: idx === 0 })),
      ),
    );
    fd.set(
      "shades",
      JSON.stringify(
        shades
          .filter((s) => s.name.trim() !== "")
          .map((s) => ({
            code: s.code.trim() === "" ? null : s.code.trim(),
            name: s.name.trim(),
            color_hex: s.color_hex === "" ? null : s.color_hex,
            is_available: s.is_available,
            image: s.image
              ? { url: s.image.url, path: s.image.path, is_cover: false }
              : null,
          })),
      ),
    );
    startSaving(async () => {
      const result = await saveProductAction({}, fd);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      notifyCatalogChanged();
      router.push("/admin/products");
      router.refresh();
    });
  }

  function handleDelete() {
    const fd = new FormData();
    fd.set("id", initial.id);
    startSaving(async () => {
      const result = await deleteProductAction({}, fd);
      if (result.error) {
        setFormError(result.error);
        setConfirmDelete(false);
        return;
      }
      notifyCatalogChanged();
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-0">
      <section className="card p-4 md:p-6">
        <h2 className="mb-4 text-lg" style={{ fontFamily: "var(--font-display)" }}>
          Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Name
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 120))}
              required
              maxLength={120}
            />
          </label>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:border-[#0C3B25] focus:outline-none"
            >
              <option value="">Select Brand (Optional)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Categories (One product can belong to multiple categories)
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-xl bg-gray-50/50">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                      } else {
                        setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? "bg-[#0C3B25] text-white border-[#0C3B25] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}{cat.name}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Selected: {selectedCategoryIds.length} categories
              {selectedCategoryIds.length > 0 && categories.find((c) => c.id === selectedCategoryIds[0]) ? (
                <span className="ml-2 font-medium text-emerald-800">
                  (Primary: {categories.find((c) => c.id === selectedCategoryIds[0])?.name})
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-5 w-5"
                style={{ accentColor: "var(--ink)" }}
              />
              Visible on website
            </label>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-5 w-5"
                  style={{ accentColor: "var(--ink)" }}
                />
                In stock
              </label>
              <p className="text-xs" style={{ color: "var(--ink-2)" }}>
                When off, customers see &apos;This product is out of stock&apos; and cannot order it.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Price (PKR)
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 1500"
              className="field"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Discount Price (PKR)
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 1200 (optional sale price)"
              className="field"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm font-semibold">
          Description
          <textarea
            className="field h-28 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          />
        </label>
      </section>

      <section className="card p-4 md:p-6">
        <h2 className="mb-4 text-lg" style={{ fontFamily: "var(--font-display)" }}>
          Photos
        </h2>
        <ImageUploader
          items={images}
          onChange={setImages}
          productId={initial.id}
        />
      </section>

      <section className="card p-4 md:p-6">
        <h2 className="mb-4 text-lg" style={{ fontFamily: "var(--font-display)" }}>
          Shades
        </h2>
        <ShadeEditor
          shades={shades}
          onChange={setShades}
          onPendingChange={setPendingShadeInput}
          productId={initial.id}
        />
      </section>

      {formError ? (
        <p className="text-sm font-bold" style={{ color: "var(--brick)" }} role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn-primary flex-1 md:flex-none"
          type="button"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving" : "Save product"}
        </button>
        <button
          className="btn-secondary flex-1 md:flex-none"
          type="button"
          onClick={() => {
            if (dirty && !window.confirm("Leave without saving? Changes will be lost.")) {
              return;
            }
            router.push("/admin/products");
          }}
        >
          Cancel
        </button>
        {!isNew ? (
          <button
            className="btn-danger md:ml-auto"
            type="button"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        ) : null}
      </div>

      {!isNew && confirmDelete ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: "rgba(26,24,20,.35)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="card w-full max-w-md p-6">
            <p className="mb-4 font-semibold">Delete product? This cannot be undone.</p>
            <div className="flex gap-3">
              <button className="btn-danger flex-1" type="button" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
              <button
                className="btn-secondary flex-1"
                type="button"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {saving ? (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
          <span
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--ink)", color: "var(--white)" }}
          >
            Saving…
          </span>
        </div>
      ) : null}
    </div>
  );
}
