"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductCurationAction,
} from "@/lib/actions/products";
import type { AdminProductRow } from "@/lib/data-admin";

function CurationToggle({
  productId,
  field,
  label,
  checked,
  pending,
}: {
  productId: string;
  field: "is_best_seller" | "is_korean";
  label: string;
  checked: boolean;
  pending: boolean;
}) {
  const router = useRouter();
  const [toggling, startT] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(checked);

  function toggle() {
    const next = !optimistic;
    startT(async () => {
      setOptimistic(next);
      const fd = new FormData();
      fd.set("id", productId);
      fd.set("field", field);
      fd.set("value", String(next));
      await toggleProductCurationAction({}, fd);
      router.refresh();
    });
  }

  const isDisabled = pending || toggling;

  return (
    <label className="flex cursor-pointer items-center gap-1.5 select-none" title={label}>
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        disabled={isDisabled}
        onClick={toggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          optimistic
            ? "border-emerald-600 bg-emerald-600"
            : "border-gray-300 bg-gray-200"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            optimistic ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">{label}</span>
    </label>
  );
}

export default function ProductsList({
  products,
  categories,
  query,
  categoryId,
  sort = "",
}: {
  products: AdminProductRow[];
  categories: { id: string; name: string }[];
  query: string;
  categoryId: string;
  sort?: string;
}) {
  const router = useRouter();
  const [pending, startPending] = useTransition();

  function runDuplicate(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    startPending(async () => {
      const result = await duplicateProductAction({}, fd);
      if (!result.error) {
        router.refresh();
      }
    });
  }

  function runDelete(id: string) {
    if (!window.confirm("Delete product? This cannot be undone.")) return;
    const fd = new FormData();
    fd.set("id", id);
    startPending(async () => {
      const result = await deleteProductAction({}, fd);
      if (!result.error) {
        router.refresh();
      }
    });
  }

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <form
        className="mb-4 flex flex-wrap gap-2"
        action="/admin/products"
        method="get"
      >
        <input
          className="field max-w-xs flex-1"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products"
          aria-label="Search products"
        />
        <select
          className="field max-w-[220px]"
          name="category"
          defaultValue={categoryId}
          aria-label="Filter by category"
        >
          <option value="">All categories (A to Z)</option>
          {sortedCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="field max-w-[190px]"
          name="sort"
          defaultValue={sort}
          aria-label="Sort products"
        >
          <option value="">Sort: Newest First</option>
          <option value="name_asc">Sort: Name (A to Z)</option>
        </select>
        <button className="btn-secondary" type="submit">
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <div className="card p-8 text-center">
          <p style={{ color: "var(--ink-2)" }}>No products found.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="card w-full min-w-[740px] text-left text-sm">
              <thead>
                <tr style={{ background: "var(--linen)" }}>
                  <th className="rounded-tl-xl px-4 py-3 font-bold">Product</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Curation</th>
                  <th className="rounded-tr-xl px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.cover_url ? (
                          <Image
                            src={p.cover_url}
                            alt={p.name}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-lg object-contain"
                            style={{ background: "var(--linen)" }}
                            unoptimized
                          />
                        ) : (
                          <div
                            className="h-11 w-11 rounded-lg"
                            style={{ background: "var(--linen)" }}
                          />
                        )}
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded px-2 py-1 text-xs font-bold"
                        style={
                          p.is_visible
                            ? { background: "var(--ink)", color: "var(--white)" }
                            : { background: "var(--linen)", border: "1px solid var(--line)" }
                        }
                      >
                        {p.is_visible ? "Visible" : "Hidden"}
                      </span>{" "}
                      {!p.in_stock ? (
                        <span
                          className="rounded px-2 py-1 text-xs font-bold"
                          style={{ background: "var(--linen)", border: "1px solid var(--line)" }}
                        >
                          Out of stock
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <CurationToggle
                          productId={p.id}
                          field="is_best_seller"
                          label="Best Seller"
                          checked={p.is_best_seller}
                          pending={pending}
                        />
                        <CurationToggle
                          productId={p.id}
                          field="is_korean"
                          label="Korean"
                          checked={p.is_korean}
                          pending={pending}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="btn-secondary !min-h-[40px] !px-4 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn-secondary !min-h-[40px] !px-4 text-sm"
                          type="button"
                          disabled={pending}
                          onClick={() => runDuplicate(p.id)}
                        >
                          Duplicate
                        </button>
                        <button
                          className="btn-danger !min-h-[40px] !px-4 text-sm"
                          type="button"
                          disabled={pending}
                          onClick={() => runDelete(p.id)}
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

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="card p-3">
                <div className="flex items-center gap-3">
                  {p.cover_url ? (
                    <Image
                      src={p.cover_url}
                      alt={p.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-lg object-contain"
                      style={{ background: "var(--linen)" }}
                      unoptimized
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-lg"
                      style={{ background: "var(--linen)" }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-sm" style={{ color: "var(--ink-2)" }}>
                      {p.category_name}
                    </p>
                    <p className="text-xs font-bold">
                      {p.is_visible ? "Visible" : "Hidden"}
                      {!p.in_stock ? " · Out of stock" : ""}
                    </p>
                  </div>
                </div>
                {/* Mobile curation toggles */}
                <div className="mt-2 flex items-center gap-4">
                  <CurationToggle
                    productId={p.id}
                    field="is_best_seller"
                    label="Best Seller"
                    checked={p.is_best_seller}
                    pending={pending}
                  />
                  <CurationToggle
                    productId={p.id}
                    field="is_korean"
                    label="Korean"
                    checked={p.is_korean}
                    pending={pending}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/products/${p.id}`} className="btn-secondary !min-h-[40px] !px-4 text-sm">
                    Edit
                  </Link>
                  <button
                    className="btn-secondary !min-h-[40px] !px-4 text-sm"
                    type="button"
                    disabled={pending}
                    onClick={() => runDuplicate(p.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="btn-danger !min-h-[40px] !px-4 text-sm"
                    type="button"
                    disabled={pending}
                    onClick={() => runDelete(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
