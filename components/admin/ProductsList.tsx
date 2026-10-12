"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  deleteProductAction,
  duplicateProductAction,
} from "@/lib/actions/products";
import type { AdminProductRow } from "@/lib/data-admin";
import { formatMoney } from "@/lib/price";

export default function ProductsList({
  products,
  categories,
  query,
  categoryId,
}: {
  products: AdminProductRow[];
  categories: { id: string; name: string }[];
  query: string;
  categoryId: string;
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
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn-secondary" type="submit">
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <div className="card p-8 text-center">
          <p style={{ color: "rgba(0,0,0,.68)" }}>No products found.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="card w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr style={{ background: "var(--blush)" }}>
                  <th className="rounded-tl-xl px-4 py-3 font-bold">Product</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Price</th>
                  <th className="px-4 py-3 font-bold">Status</th>
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
                            style={{ background: "var(--blush)" }}
                            unoptimized
                          />
                        ) : (
                          <div
                            className="h-11 w-11 rounded-lg"
                            style={{ background: "var(--blush)" }}
                          />
                        )}
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category_name}</td>
                    <td className="px-4 py-3">
                      <b>{formatMoney(p.discount_price ?? p.price)}</b>{" "}
                      {p.discount_price !== null ? (
                        <s style={{ color: "rgba(0,0,0,.68)" }}>
                          {formatMoney(p.price)}
                        </s>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded px-2 py-1 text-xs font-bold"
                        style={
                          p.is_visible
                            ? { background: "var(--ink)", color: "var(--white)" }
                            : { background: "var(--blush)", border: "1px solid var(--line)" }
                        }
                      >
                        {p.is_visible ? "Visible" : "Hidden"}
                      </span>{" "}
                      {!p.in_stock ? (
                        <span
                          className="rounded px-2 py-1 text-xs font-bold"
                          style={{ background: "var(--blush)", border: "1px solid var(--line)" }}
                        >
                          Out of stock
                        </span>
                      ) : null}
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
                      style={{ background: "var(--blush)" }}
                      unoptimized
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-lg"
                      style={{ background: "var(--blush)" }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="text-sm" style={{ color: "rgba(0,0,0,.68)" }}>
                      {p.category_name} ·{" "}
                      <b>{formatMoney(p.discount_price ?? p.price)}</b>
                    </p>
                    <p className="text-xs font-bold">
                      {p.is_visible ? "Visible" : "Hidden"}
                      {!p.in_stock ? " · Out of stock" : ""}
                    </p>
                  </div>
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
