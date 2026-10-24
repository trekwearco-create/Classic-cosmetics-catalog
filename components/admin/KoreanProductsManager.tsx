"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AdminProductRow } from "@/lib/data-admin";
import { updateKoreanProductsAction } from "@/lib/actions/products";

export default function KoreanProductsManager({
  initialProducts,
}: {
  initialProducts: AdminProductRow[];
}) {
  const [products] = useState<AdminProductRow[]>(initialProducts);
  const [koreanMap, setKoreanMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialProducts.forEach((p) => {
      map[p.id] = p.is_korean;
    });
    return map;
  });

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "korean_only" | "non_korean">("all");
  const [isPending, startTransition] = useTransition();
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const toggleProduct = (id: string) => {
    setKoreanMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setSavedFeedback(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      const updates = Object.entries(koreanMap).map(([id, is_korean]) => ({
        id,
        is_korean,
      }));

      const res = await updateKoreanProductsAction(updates);
      if (res.success) {
        setSavedFeedback("Changes saved successfully! Korean collection updated.");
        setTimeout(() => setSavedFeedback(null), 3000);
      } else {
        setSavedFeedback(res.error || "Failed to save changes. Make sure migrations are run.");
      }
    });
  };

  const koreanCount = Object.values(koreanMap).filter(Boolean).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name.toLowerCase().includes(search.toLowerCase());

    const isKorean = Boolean(koreanMap[p.id]);

    if (!matchesSearch) return false;
    if (filterMode === "korean_only") return isKorean;
    if (filterMode === "non_korean") return !isKorean;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-gray-900">Korean Beauty Collection</h1>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {koreanCount} Selected
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Check or uncheck products to curate the dedicated Korean Beauty section on the homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C3B25] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#155d3a] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? "Saving changes..." : "Save Korean Collection"}
        </button>
      </div>

      {savedFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            savedFeedback.includes("success")
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {savedFeedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs focus:border-[#0C3B25] focus:outline-none"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterMode === "all"
                ? "bg-[#0C3B25] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("korean_only")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterMode === "korean_only"
                ? "bg-[#0C3B25] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Korean Only ({koreanCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("non_korean")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterMode === "non_korean"
                ? "bg-[#0C3B25] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Non-Korean ({products.length - koreanCount})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">Korean</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No products found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const isChecked = Boolean(koreanMap[product.id]);
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50/60 transition-colors ${
                      isChecked ? "bg-emerald-50/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduct(product.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#0C3B25] focus:ring-[#0C3B25] cursor-pointer"
                        aria-label={`Toggle ${product.name} Korean status`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          {product.cover_url ? (
                            <Image
                              src={product.cover_url}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[8px] text-gray-400">
                              No pic
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="text-[10px] text-emerald-700 hover:underline"
                          >
                            View product ↗
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {product.category_name || "Uncategorized"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          product.in_stock
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
