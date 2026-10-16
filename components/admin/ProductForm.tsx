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

type CategoryOption = { id: string; name: string };

export type ProductFormInitial = {
  id: string;
  name: string;
  slug: string;
  description: string;
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
  const [isVisible, setIsVisible] = useState(initial.is_visible);
  const [inStock, setInStock] = useState(initial.in_stock);
  const [images, setImages] = useState<UploadItem[]>(initial.images);
  const [shades, setShades] = useState<ShadeRow[]>(initial.shades);
  const [pendingShadeInput, setPendingShadeInput] = useState(false);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        name: initial.name,
        categoryId: initial.category_id,
        description: initial.description,
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
        is_visible: isVisible,
        in_stock: inStock,
        images: images.filter((i) => i.progress === "done").map((i) => i.path),
        shades,
      }),
    [name, categoryId, description, isVisible, inStock, images, shades],
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
    const fd = new FormData();
    fd.set(
      "payload",
      JSON.stringify({
        id: initial.id,
        name: name.trim(),
        category_id: categoryId,
        description: description.trim() === "" ? null : description.trim(),
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
