"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import ImageUploader, { type UploadItem } from "@/components/admin/ImageUploader";
import ShadeEditor, { type ShadeRow } from "@/components/admin/ShadeEditor";
import {
  deleteProductAction,
  saveProductAction,
} from "@/lib/actions/products";
import { discountPercent } from "@/lib/price";

type CategoryOption = { id: string; name: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  discount_price: string;
  is_visible: boolean;
  in_stock: boolean;
  category_id: string;
  images: UploadItem[];
  shades: ShadeRow[];
};

export default function ProductForm({
  categories,
  initial,
  isNew,
}: {
  categories: CategoryOption[];
  initial: ProductFormInitial;
  isNew: boolean;
}) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(initial.name);
  const [categoryId, setCategoryId] = useState(initial.category_id);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.price);
  const [discountPrice, setDiscountPrice] = useState(initial.discount_price);
  const [isVisible, setIsVisible] = useState(initial.is_visible);
  const [inStock, setInStock] = useState(initial.in_stock);
  const [images, setImages] = useState<UploadItem[]>(initial.images);
  const [shades, setShades] = useState<ShadeRow[]>(initial.shades);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: initial.name,
        categoryId: initial.category_id,
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
        categoryId,
        description,
        price,
        discount_price: discountPrice,
        is_visible: isVisible,
        in_stock: inStock,
        images: images.filter((i) => i.progress === "done").map((i) => i.path),
        shades,
      }),
    [name, categoryId, description, price, discountPrice, isVisible, inStock, images, shades],
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

  const percent =
    price !== "" && discountPrice !== "" && Number(price) > 0
      ? discountPercent({ price: Number(price), discount_price: Number(discountPrice) })
      : 0;
  const discountInvalid =
    discountPrice !== "" &&
    price !== "" &&
    Number(discountPrice) >= Number(price);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

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
    if (name.trim().length < 2 || categoryId === "") {
      setFormError("Fill in the name and choose a category.");
      return;
    }
    if (discountInvalid) {
      setFormError("Discounted price must be lower than the original price.");
      return;
    }
    if (images.some((i) => i.progress !== "done")) {
      setFormError("Wait for the photos to finish uploading, then save.");
      return;
    }
    const fd = new FormData();
    fd.set(
      "payload",
      JSON.stringify({
        id: initial.id,
        name: name.trim(),
        category_id: categoryId,
        description: description.trim() === "" ? null : description.trim(),
        price: price === "" ? 0 : Number(price),
        discount_price:
          discountPrice === "" ? null : Number(discountPrice),
        is_visible: isVisible,
        in_stock: inStock,
      }),
    );
    fd.set(
      "images",
      JSON.stringify(
        images.map((i) => ({ url: i.url, path: i.path, is_cover: false })),
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
          })),
      ),
    );
    startSaving(async () => {
      const result = await saveProductAction({}, fd);
      if (result.error) {
        setFormError(result.error);
        return;
      }
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
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Category
            <select
              className="field"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Original price (Rs.)
            <input
              className="field"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Discounted price (Rs.)
            <span className="sr-only">
              Discounted price must be lower than the original price.
            </span>
            <input
              className={`field${discountInvalid ? " border-2" : ""}`}
              style={discountInvalid ? { borderColor: "var(--rose)" } : undefined}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
            {discountInvalid ? (
              <span className="text-xs font-semibold" style={{ color: "var(--rose)" }}>
                Discounted price must be lower than the original price.
              </span>
            ) : null}
          </label>
          <div
            className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold"
            style={{ background: "var(--blush)" }}
          >
            Discount
            {percent > 0 ? `${percent}% OFF` : "none"}
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-5 w-5 accent-black"
              />
              Visible on website
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="h-5 w-5 accent-black"
              />
              In stock
            </label>
          </div>
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
        <ShadeEditor shades={shades} onChange={setShades} />
      </section>

      {formError ? (
        <p className="text-sm font-bold" style={{ color: "var(--rose)" }} role="alert">
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
          style={{ background: "rgba(0,0,0,.35)" }}
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
