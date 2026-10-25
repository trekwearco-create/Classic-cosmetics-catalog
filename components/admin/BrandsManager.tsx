"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBrandAction, deleteBrandAction } from "@/lib/actions/brands";
import type { AdminBrand } from "@/lib/data-admin";
import { slugify } from "@/lib/slug";

export default function BrandsManager({ initial }: { initial: AdminBrand[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState<AdminBrand[]>(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setFormError(null);
    try {
      const body = new FormData();
      body.set("purpose", "category");
      body.set("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.url) {
        setLogoUrl(data.url);
      }
    } catch {
      setFormError("Failed to upload brand logo. You can also paste an image URL directly.");
    } finally {
      setUploading(false);
    }
  }

  function handleAddBrand(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Brand name is required.");
      return;
    }

    const finalSlug = slug.trim() ? slugify(slug) : slugify(name);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name.trim());
      fd.set("slug", finalSlug);
      if (logoUrl.trim()) fd.set("logo_url", logoUrl.trim());

      const res = await saveBrandAction({}, fd);
      if (res.error) {
        setFormError(res.error);
      } else {
        // Reset form
        setName("");
        setSlug("");
        setLogoUrl("");
        setIsSlugManual(false);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, brandName: string) {
    if (!confirm(`Are you sure you want to delete brand "${brandName}"? Any associated products will have their brand unassigned.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await deleteBrandAction({}, fd);
      if (res.error) {
        alert(res.error);
      } else {
        setBrands((prev) => prev.filter((b) => b.id !== id));
        router.refresh();
      }
      setDeletingId(null);
    });
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display, serif)" }}>
            Brand Directory Management
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Create, categorize, and organize cosmetic brands linked to catalog products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">
            {brands.length} Total {brands.length === 1 ? "Brand" : "Brands"}
          </span>
        </div>
      </div>

      {/* Add Brand Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="text-base font-bold text-gray-900 sm:text-lg mb-4">
          Add New Brand
        </h2>

        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleAddBrand} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Medora of London"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:border-[#0C3B25] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Slug (Auto-generated)
            </label>
            <input
              type="text"
              placeholder="e.g. medora-of-london"
              value={slug}
              onChange={(e) => {
                setIsSlugManual(true);
                setSlug(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:border-[#0C3B25] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Logo URL or File Upload (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://... or upload"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs focus:border-[#0C3B25] focus:outline-none"
              />
              <label className="shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <span>{uploading ? "..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending || uploading}
              className="inline-flex items-center gap-2 rounded-full bg-[#0C3B25] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-900 disabled:opacity-50"
            >
              {isPending ? "Adding..." : "+ Add Brand"}
            </button>
          </div>
        </form>
      </div>

      {/* Alphabetical Brands Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            Brands (A &rarr; Z)
          </h2>
          <span className="text-xs text-gray-500">
            Sorted alphabetically
          </span>
        </div>

        {brands.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-500">
            No brands found in database. Add your first brand using the form above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {brands.map((b) => (
              <div
                key={b.id}
                className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs transition hover:border-emerald-500 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-emerald-50/50 flex items-center justify-center">
                    {b.logo_url ? (
                      <Image
                        src={b.logo_url}
                        alt={b.name}
                        fill
                        unoptimized
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-xs font-bold text-emerald-800">
                        {b.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                      {b.name}
                    </p>
                    <p className="truncate text-[10px] text-gray-400">
                      /{b.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600" title="Products assigned to this brand">
                    {b.product_count ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id, b.name)}
                    disabled={deletingId === b.id || isPending}
                    aria-label={`Delete ${b.name}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
