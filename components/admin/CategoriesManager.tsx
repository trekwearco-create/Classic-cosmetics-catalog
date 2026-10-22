"use client";

import { useActionState, useEffect, useState } from "react";

import CategoryImageUploader from "@/components/admin/CategoryImageUploader";
import {
  deleteCategoryAction,
  saveCategoryAction,
  type CategoryFormState,
} from "@/lib/actions/categories";
import type { AdminCategory } from "@/lib/data-admin";
import { notifyCatalogChanged } from "@/lib/catalog-sync";

const EMPTY_STATE: CategoryFormState = {};

export default function CategoriesManager({
  initial,
}: {
  initial: AdminCategory[];
}) {
  const [categories] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const [saveState, saveAction, savePending] = useActionState(
    saveCategoryAction,
    EMPTY_STATE,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategoryAction,
    EMPTY_STATE,
  );

  const anyOpen = adding || editing !== null || deleting !== null;
  useEffect(() => {
    if (
      !anyOpen ||
      (saveState.success === undefined && deleteState.success === undefined)
    ) {
      return;
    }
    notifyCatalogChanged();
    window.location.reload();
  }, [anyOpen, saveState.success, deleteState.success]);

  const showForm = adding || editing !== null;
  const formKey = editing?.id ?? "new";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Categories
        </h1>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            setAdding(true);
            setEditing(null);
            setImageUrl("");
          }}
        >
          Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card p-8 text-center">
          <p style={{ color: "var(--ink-2)" }}>No categories yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr style={{ background: "var(--linen)" }}>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Products</th>
                <th className="px-4 py-3 font-bold">Order</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-t"
                  style={{ borderColor: "var(--line)" }}
                >
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">{c.product_count}</td>
                  <td className="px-4 py-3">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary !min-h-[40px] !px-4 text-sm"
                        type="button"
                        onClick={() => {
                          setEditing(c);
                          setAdding(false);
                          setImageUrl(c.image_url ?? "");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger !min-h-[40px] !px-4 text-sm"
                        type="button"
                        onClick={() => setDeleting(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: "rgba(26,24,20,.35)" }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="card max-h-[90dvh] w-full max-w-md overflow-y-auto p-6"
            key={formKey}
          >
            <h2 className="mb-4 text-xl" style={{ fontFamily: "var(--font-display)" }}>
              {editing ? "Edit category" : "Add category"}
            </h2>
            <form action={saveAction} className="flex flex-col gap-4">
              {editing ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}
              <input type="hidden" name="image_url" value={imageUrl} />
              <label className="text-sm font-semibold" htmlFor="cat-name">
                Name
              </label>
              <input
                className="field"
                id="cat-name"
                name="name"
                defaultValue={editing?.name ?? ""}
                maxLength={60}
                required
              />
              <label className="text-sm font-semibold" htmlFor="cat-order">
                Display order
              </label>
              <input
                className="field"
                id="cat-order"
                name="sort_order"
                type="number"
                min={0}
                max={9999}
                defaultValue={editing?.sort_order ?? 0}
              />
              <label className="text-sm font-semibold" htmlFor="cat-parent">
                Parent Category (Optional)
              </label>
              <select
                className="field"
                id="cat-parent"
                name="parent_id"
                defaultValue={editing?.parent_id ?? ""}
              >
                <option value="">None (Top-level Category)</option>
                {categories
                  .filter((cat) => !editing || cat.id !== editing.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <CategoryImageUploader imageUrl={imageUrl} onChange={setImageUrl} />
              {saveState.error ? (
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--brick)" }}
                  role="alert"
                >
                  {saveState.error}
                </p>
              ) : null}
              <div className="mt-2 flex gap-3">
                <button
                  className="btn-primary flex-1"
                  type="submit"
                  disabled={savePending}
                >
                  {savePending ? "Saving" : "Save category"}
                </button>
                <button
                  className="btn-secondary flex-1"
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: "rgba(26,24,20,.35)" }}
          role="dialog"
          aria-modal="true"
        >
          <div className="card w-full max-w-md p-6">
            <p className="mb-4 font-semibold">Delete “{deleting.name}”?</p>
            {deleteState.error ? (
              <p
                className="mb-3 text-sm font-semibold"
                style={{ color: "var(--brick)" }}
                role="alert"
              >
                {deleteState.error}
              </p>
            ) : null}
            <form action={deleteAction} className="flex gap-3">
              <input type="hidden" name="id" value={deleting.id} />
              <button
                className="btn-danger flex-1"
                type="submit"
                disabled={deletePending}
              >
                Delete
              </button>
              <button
                className="btn-secondary flex-1"
                type="button"
                onClick={() => setDeleting(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
