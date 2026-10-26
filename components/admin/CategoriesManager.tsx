"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import CategoryImageUploader from "@/components/admin/CategoryImageUploader";
import {
  deleteCategoryAction,
  fastUpdateCategoryAction,
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
  const [categories, setCategories] = useState(initial);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  // Form fields (Strictly Main Categories)
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [showInMenu, setShowInMenu] = useState(true);
  const [showInHomepage, setShowInHomepage] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleHomepage = async (c: AdminCategory) => {
    const nextVal = !c.show_in_homepage;
    setTogglingId(c.id);
    setCategories((prev) =>
      prev.map((item) =>
        item.id === c.id ? { ...item, show_in_homepage: nextVal } : item,
      ),
    );
    const res = await fastUpdateCategoryAction(c.id, { show_in_homepage: nextVal });
    if (!res.success) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === c.id ? { ...item, show_in_homepage: !nextVal } : item,
        ),
      );
    } else {
      notifyCatalogChanged();
    }
    setTogglingId(null);
  };

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
    if (!anyOpen || (!saveState.success && !deleteState.success)) return;
    notifyCatalogChanged();
    window.location.reload();
  }, [anyOpen, saveState.success, deleteState.success]);

  // Open modal for editing
  const startEdit = (c: AdminCategory) => {
    setEditing(c);
    setAdding(false);
    setName(c.name);
    setSlug(c.slug);
    setImageUrl(c.image_url ?? "");
    setSortOrder(c.sort_order);
    setShowInMenu(c.show_in_menu !== false);
    setShowInHomepage(c.show_in_homepage === true);
    setIsActive(c.is_active !== false);
    setDescription(c.description ?? "");
    setAutoSlug(false);
  };

  // Open modal for adding
  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setName("");
    setSlug("");
    setImageUrl("");
    setSortOrder(0);
    setShowInMenu(true);
    setShowInHomepage(false);
    setIsActive(true);
    setDescription("");
    setAutoSlug(true);
  };

  // Auto-slug generation directly from category name
  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  };

  const showForm = adding || editing !== null;

  // Filtered & A to Z sorted main categories
  const sortedCategories = useMemo(() => {
    const list = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term),
    );
  }, [categories, search]);

  return (
    <div>
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Main Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Single-level main categories for storefront navigation, product categorization, and homepage stories rail.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-sm">
              ★ {categories.filter((c) => c.show_in_homepage).length} on Homepage &ldquo;Shop by Category&rdquo;
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700 border border-gray-200">
              Total {categories.length} Categories
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            type="button"
            onClick={startAdd}
          >
            + Add Main Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter categories by name or slug..."
          className="w-full max-w-md rounded-lg border border-gray-300 px-3.5 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Categories Flat Table */}
      {sortedCategories.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No categories found.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto no-scrollbar">
          <table className="w-full min-w-full text-left text-sm">
            <thead>
              <tr style={{ background: "var(--linen)" }}>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-gray-700">Category</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-gray-700">Products</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-gray-700">Homepage Featured</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-gray-700">Status</th>
                <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedCategories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {c.image_url ? (
                        <Image
                          src={c.image_url}
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover shrink-0 border border-gray-200"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shrink-0">
                          {c.name.slice(0, 1)}
                        </span>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 text-sm block">{c.name}</span>
                        <span className="text-xs text-gray-400 font-mono">/{c.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600 font-medium">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {c.product_count} {c.product_count === 1 ? "product" : "products"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleHomepage(c)}
                      disabled={togglingId === c.id}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        c.show_in_homepage
                          ? "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Toggle appearance in Homepage 'Shop by Category'"
                    >
                      ★ {c.show_in_homepage ? "On Homepage" : "+ Add to Home"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-medium ${c.is_active !== false ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                      {c.is_active !== false ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn-secondary !min-h-[32px] !px-3 text-xs" type="button" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button className="btn-secondary !min-h-[32px] !px-3 text-xs text-rose-600 hover:text-rose-700" type="button" onClick={() => setDeleting(c)}>
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

      {/* Add / Edit Modal (Strictly Single-Level Main Category) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl mx-auto px-4 py-6 overflow-x-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto box-border">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {editing ? `Edit: ${editing.name}` : "Add Main Category"}
            </h2>

            {saveState.error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {saveState.error}
              </div>
            )}

            <form action={saveAction} className="space-y-4 w-full max-w-full box-border">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              {/* Always enforce parent_id is NULL */}
              <input type="hidden" name="parent_id" value="" />

              {/* Name */}
              <div className="w-full max-w-full box-border">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  maxLength={60}
                  className="w-full max-w-full box-border rounded-lg border border-gray-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Skincare"
                />
              </div>

              {/* Slug */}
              <div className="w-full max-w-full box-border">
                <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Slug (URL Key) *
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Auto-generate</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setSlug(e.target.value);
                  }}
                  required
                  maxLength={120}
                  className="w-full max-w-full box-border rounded-lg border border-gray-300 p-2.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. skincare"
                />
              </div>

              {/* Image Uploader */}
              <div className="w-full max-w-full box-border">
                <CategoryImageUploader
                  imageUrl={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
                <input type="hidden" name="image_url" value={imageUrl} />
              </div>

              {/* Sort Order & Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-full box-border">
                <div className="w-full max-w-full box-border">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    max={9999}
                    className="w-full max-w-full box-border rounded-lg border border-gray-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer rounded-lg bg-emerald-50/90 p-2.5 border border-emerald-200 shadow-sm box-border">
                    <input
                      type="checkbox"
                      name="show_in_homepage"
                      checked={showInHomepage}
                      onChange={(e) => setShowInHomepage(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4 shrink-0"
                    />
                    <span className="font-bold text-emerald-900 leading-tight">Show in Shop by Category (Homepage)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="show_in_menu"
                      checked={showInMenu}
                      onChange={(e) => setShowInMenu(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4 shrink-0"
                    />
                    <span>Show in Navigation Menu</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4 shrink-0"
                    />
                    <span>Active on Website</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="w-full max-w-full box-border">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full max-w-full box-border rounded-lg border border-gray-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="Optional brief description for SEO"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  className="btn-secondary !min-h-0 p-2.5 text-xs"
                  onClick={() => {
                    setAdding(false);
                    setEditing(null);
                  }}
                  disabled={savePending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary !min-h-0 p-2.5 px-5 text-xs"
                  disabled={savePending}
                >
                  {savePending ? "Saving..." : editing ? "Save Changes" : "Create Main Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm">
          <div className="w-full max-w-md mx-auto px-4 py-6 overflow-x-hidden rounded-2xl bg-white shadow-2xl box-border">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-bold text-gray-900">“{deleting.name}”</span>?
            </p>

            {deleting.product_count > 0 ? (
              <div className="mb-4 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200">
                ⚠️ This category currently contains <span className="font-bold">{deleting.product_count}</span> products. Move them to another category first.
              </div>
            ) : null}

            {deleteState.error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {deleteState.error}
              </div>
            )}

            <form action={deleteAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="id" value={deleting.id} />
              <button
                type="button"
                className="btn-secondary !min-h-0 p-2.5 text-xs"
                onClick={() => setDeleting(null)}
                disabled={deletePending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                disabled={deletePending || deleting.product_count > 0}
              >
                {deletePending ? "Deleting..." : "Delete Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
