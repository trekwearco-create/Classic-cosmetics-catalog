"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [showInMenu, setShowInMenu] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  // Expanded tree branches
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  // Build tree from categories
  const { rootNodes, childrenMap } = useMemo(() => {
    const childrenMap = new Map<string, AdminCategory[]>();
    const rootNodes: AdminCategory[] = [];

    for (const c of categories) {
      if (c.parent_id) {
        const list = childrenMap.get(c.parent_id) ?? [];
        list.push(c);
        childrenMap.set(c.parent_id, list);
      } else {
        rootNodes.push(c);
      }
    }

    // Sort by sort_order then name
    const sorter = (a: AdminCategory, b: AdminCategory) =>
      a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    rootNodes.sort(sorter);
    for (const [, list] of childrenMap.entries()) {
      list.sort(sorter);
    }

    return { rootNodes, childrenMap };
  }, [categories]);

  // Open modal for editing
  const startEdit = (c: AdminCategory) => {
    setEditing(c);
    setAdding(false);
    setName(c.name);
    setSlug(c.slug);
    setParentId(c.parent_id ?? "");
    setImageUrl(c.image_url ?? "");
    setSortOrder(c.sort_order);
    setShowInMenu(c.show_in_menu !== false);
    setIsActive(c.is_active !== false);
    setDescription(c.description ?? "");
    setAutoSlug(false);
  };

  // Open modal for adding
  const startAdd = (defaultParentId: string = "") => {
    setAdding(true);
    setEditing(null);
    setName("");
    setSlug("");
    setParentId(defaultParentId);
    setImageUrl("");
    setSortOrder(0);
    setShowInMenu(true);
    setIsActive(true);
    setDescription("");
    setAutoSlug(true);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-slug update
  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const selfSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (parentId) {
        const parent = categories.find((c) => c.id === parentId);
        setSlug(parent ? `${parent.slug}-${selfSlug}` : selfSlug);
      } else {
        setSlug(selfSlug);
      }
    }
  };

  const handleParentChange = (newParentId: string) => {
    setParentId(newParentId);
    if (autoSlug && name) {
      const selfSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      if (newParentId) {
        const parent = categories.find((c) => c.id === newParentId);
        setSlug(parent ? `${parent.slug}-${selfSlug}` : selfSlug);
      } else {
        setSlug(selfSlug);
      }
    }
  };

  const showForm = adding || editing !== null;

  // Filtered categories for search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.full_path && c.full_path.toLowerCase().includes(term)),
    );
  }, [categories, search]);

  return (
    <div>
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Category Tree
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Unlimited depth category hierarchy for desktop mega-menu and mobile navigation.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            type="button"
            onClick={() => startAdd("")}
          >
            + Add Top Category
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter categories by name or path..."
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

      {/* Categories View */}
      {categories.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No categories found in database.</p>
        </div>
      ) : filteredCategories ? (
        /* Search results view */
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr style={{ background: "var(--linen)" }}>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Full Path</th>
                <th className="px-4 py-3 font-bold">Products</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3 font-semibold">
                    <div className="flex items-center gap-2">
                      {c.image_url ? (
                        <Image src={c.image_url} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" unoptimized />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs">📁</span>
                      )}
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.full_path || c.name}</td>
                  <td className="px-4 py-3">{c.product_count}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${c.is_active !== false ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                      {c.is_active !== false ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
      ) : (
        /* Hierarchical tree view */
        <div className="space-y-3">
          {rootNodes.map((level1) => {
            const level2List = childrenMap.get(level1.id) ?? [];
            const isL1Expanded = expanded[level1.id] ?? true;

            return (
              <div key={level1.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Level 1 Item Row */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-3.5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(level1.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-600 shadow-sm transition hover:bg-gray-100"
                    >
                      {isL1Expanded ? "▼" : "▶"}
                    </button>
                    {level1.image_url ? (
                      <Image src={level1.image_url} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                        {level1.name.slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-base">{level1.name}</span>
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          Order: {level1.sort_order}
                        </span>
                        {level1.show_in_menu === false && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            Hidden from menu
                          </span>
                        )}
                        {level1.is_active === false && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono">/{level1.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startAdd(level1.id)}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      + Add Sub-category
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(level1)}
                      className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(level1)}
                      className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Level 2 Children */}
                {isL1Expanded && level2List.length > 0 && (
                  <div className="divide-y divide-gray-100 bg-white">
                    {level2List.map((level2) => {
                      const level3List = childrenMap.get(level2.id) ?? [];
                      const isL2Expanded = expanded[level2.id] ?? false;

                      return (
                        <div key={level2.id} className="pl-6 pr-4 sm:pl-10 sm:pr-6">
                          <div className="flex items-center justify-between py-2.5">
                            <div className="flex items-center gap-2.5">
                              {level3List.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(level2.id)}
                                  className="flex h-5 w-5 items-center justify-center rounded border text-[10px] text-gray-500 hover:bg-gray-100"
                                >
                                  {isL2Expanded ? "▼" : "▶"}
                                </button>
                              ) : (
                                <span className="h-5 w-5 flex items-center justify-center text-gray-300 text-xs">•</span>
                              )}
                              <span className="font-semibold text-sm text-gray-800">{level2.name}</span>
                              <span className="text-[11px] text-gray-400 font-mono">/{level2.slug}</span>
                              {level2.product_count > 0 && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  {level2.product_count} products
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startAdd(level2.id)}
                                className="text-xs text-emerald-700 hover:underline"
                              >
                                + Add Child
                              </button>
                              <button
                                type="button"
                                onClick={() => startEdit(level2)}
                                className="text-xs text-gray-600 hover:text-gray-900"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleting(level2)}
                                className="text-xs text-rose-600 hover:text-rose-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Level 3 Children */}
                          {isL2Expanded && level3List.length > 0 && (
                            <div className="mb-3 ml-7 space-y-1 border-l-2 border-emerald-200 pl-3">
                              {level3List.map((level3) => (
                                <div
                                  key={level3.id}
                                  className="flex items-center justify-between py-1 text-xs text-gray-600 hover:bg-gray-50 rounded px-1.5"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{level3.name}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">/{level3.slug}</span>
                                    {level3.product_count > 0 && (
                                      <span className="rounded bg-gray-100 px-1.5 py-0.2 text-[10px] text-gray-600">
                                        {level3.product_count} prods
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEdit(level3)}
                                      className="text-gray-600 hover:text-gray-900"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleting(level3)}
                                      className="text-rose-600 hover:text-rose-800"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {editing ? `Edit: ${editing.name}` : "Add Category"}
            </h2>

            {saveState.error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
                {saveState.error}
              </div>
            )}

            <form action={saveAction} className="space-y-4">
              {editing && <input type="hidden" name="id" value={editing.id} />}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  maxLength={60}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Face Wash"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Parent Category
                </label>
                <select
                  name="parent_id"
                  value={parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c) => !editing || c.id !== editing.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_path || c.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-[11px] text-gray-500">
                  Select a parent to place this category under it in menus and catalogs.
                </p>
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
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
                    <span>Auto-generate from path</span>
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. skincare-face-cleansing-face-wash"
                />
              </div>

              {/* Image Uploader */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category Image
                </label>
                <CategoryImageUploader
                  imageUrl={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
                <input type="hidden" name="image_url" value={imageUrl} />
              </div>

              {/* Sort Order & Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="show_in_menu"
                      checked={showInMenu}
                      onChange={(e) => setShowInMenu(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4"
                    />
                    <span>Show in Mega-Menu</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4"
                    />
                    <span>Active on Website</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Optional brief description for SEO"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="btn-secondary !min-h-[40px] !px-4 text-sm"
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
                  className="btn-primary !min-h-[40px] !px-6 text-sm"
                  disabled={savePending}
                >
                  {savePending ? "Saving..." : editing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-bold text-gray-900">“{deleting.name}”</span>?
            </p>

            {deleting.children_count && deleting.children_count > 0 ? (
              <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                ⚠️ This category has <span className="font-bold">{deleting.children_count}</span> sub-categories. You must delete or re-parent them before deleting this category.
              </div>
            ) : null}

            {deleting.product_count > 0 ? (
              <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                ⚠️ This category currently contains <span className="font-bold">{deleting.product_count}</span> products. Move them to another category first.
              </div>
            ) : null}

            {deleteState.error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {deleteState.error}
              </div>
            )}

            <form action={deleteAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="id" value={deleting.id} />
              <button
                type="button"
                className="btn-secondary !min-h-[40px] !px-4 text-sm"
                onClick={() => setDeleting(null)}
                disabled={deletePending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                disabled={deletePending || (deleting.children_count ?? 0) > 0 || deleting.product_count > 0}
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
