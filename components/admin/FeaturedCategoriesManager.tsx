"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AdminCategory } from "@/lib/data-admin";
import { updateFeaturedCategoriesAction } from "@/lib/actions/categories";

export default function FeaturedCategoriesManager({
  initialCategories,
}: {
  initialCategories: AdminCategory[];
}) {
  const [categories] = useState<AdminCategory[]>(initialCategories);
  const [featuredMap, setFeaturedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialCategories.forEach((c) => {
      map[c.id] = Boolean(c.show_in_homepage);
    });
    return map;
  });

  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setFeaturedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setSavedFeedback(null);
  };

  const handleSave = () => {
    startTransition(async () => {
      const updates = Object.entries(featuredMap).map(([id, show_in_homepage]) => ({
        id,
        show_in_homepage,
      }));

      const res = await updateFeaturedCategoriesAction(updates);
      if (res.success) {
        setSavedFeedback("Homepage categories saved successfully!");
        setTimeout(() => setSavedFeedback(null), 3000);
      } else {
        setSavedFeedback(res.error || "Failed to save. Ensure database columns exist.");
      }
    });
  };

  const featuredCount = Object.values(featuredMap).filter(Boolean).length;

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-gray-900">Shop by Categories (Homepage)</h1>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              {featuredCount} Featured
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select which categories appear prominently in the circular "Shop by Category" stories rail on the storefront homepage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C3B25] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#155d3a] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPending ? "Saving changes..." : "Save Featured Categories"}
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

      {/* Search Input */}
      <div>
        <input
          type="search"
          placeholder="Search categories by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs focus:border-[#0C3B25] focus:outline-none"
        />
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">Featured</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-center">Products</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No categories found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((category) => {
                const isChecked = Boolean(featuredMap[category.id]);
                return (
                  <tr
                    key={category.id}
                    className={`hover:bg-gray-50/60 transition-colors ${
                      isChecked ? "bg-emerald-50/20" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(category.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#0C3B25] focus:ring-[#0C3B25] cursor-pointer"
                        aria-label={`Toggle ${category.name} homepage status`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                          {category.image_url ? (
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                              ✨
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <Link
                            href={`/categories/${category.slug}`}
                            target="_blank"
                            className="text-[10px] text-emerald-700 hover:underline"
                          >
                            View category ↗
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {category.product_count} items
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          category.is_active
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.is_active ? "Active" : "Hidden"}
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
