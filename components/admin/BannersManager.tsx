"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";

import BannerImageUploader from "@/components/admin/BannerImageUploader";
import {
  saveBannerAction,
  deleteBannerAction,
  updateSectionAction,
  type BannerFormState,
} from "@/lib/actions/banners";
import type { AdminBanner, AdminHomeSection } from "@/lib/data-admin";
import { notifyCatalogChanged } from "@/lib/catalog-sync";

const EMPTY_STATE: BannerFormState = {};

export default function BannersManager({
  initialSections,
  initialBanners,
}: {
  initialSections: AdminHomeSection[];
  initialBanners: AdminBanner[];
}) {
  const [sections, setSections] = useState(initialSections);
  const [banners] = useState(initialBanners);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>(
    initialSections[0]?.key ?? "hero_slider",
  );

  const [addingBanner, setAddingBanner] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBanner | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [extraText, setExtraText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDesktop, setImageDesktop] = useState("");
  const [imageMobile, setImageMobile] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);

  const [saveState, saveAction, savePending] = useActionState(
    saveBannerAction,
    EMPTY_STATE,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBannerAction,
    EMPTY_STATE,
  );

  const anyOpen = addingBanner || editingBanner !== null || deletingBanner !== null;
  useEffect(() => {
    if (!anyOpen || (!saveState.success && !deleteState.success)) return;
    notifyCatalogChanged();
    window.location.reload();
  }, [anyOpen, saveState.success, deleteState.success]);

  const activeSection = sections.find((s) => s.key === selectedSectionKey);
  const activeBanners = banners.filter((b) => b.section_key === selectedSectionKey);

  const startAddBanner = () => {
    setAddingBanner(true);
    setEditingBanner(null);
    setTitle("");
    setExtraText("");
    setLinkUrl("/");
    setImageDesktop("");
    setImageMobile("");
    setAlt("");
    setSortOrder((activeBanners.length + 1) * 10);
    setIsActive(true);
  };

  const startEditBanner = (b: AdminBanner) => {
    setEditingBanner(b);
    setAddingBanner(false);
    setTitle(b.title ?? "");
    setExtraText(b.extra_text ?? "");
    setLinkUrl(b.link_url ?? "");
    setImageDesktop(b.image_url_desktop ?? "");
    setImageMobile(b.image_url_mobile ?? "");
    setAlt(b.alt ?? "");
    setSortOrder(b.sort_order);
    setIsActive(b.is_active);
  };

  const toggleSectionVisibility = async (section: AdminHomeSection) => {
    const nextVal = !section.is_visible;
    setSections((prev) =>
      prev.map((s) => (s.key === section.key ? { ...s, is_visible: nextVal } : s)),
    );
    await updateSectionAction(section.key, { is_visible: nextVal });
    notifyCatalogChanged();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Home Sections & Banners
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Control all home page sliders, promo strips, Korean Beauty tiles, and banner collections.
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">
            Home sections table is not populated yet. Apply migration 006 to seed standard sections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Section selector sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-2 mb-2">
              Sections (Highfy Order)
            </h2>
            <div className="space-y-1.5 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              {sections.map((sec) => {
                const isSelected = sec.key === selectedSectionKey;
                const bannerCount = banners.filter((b) => b.section_key === sec.key).length;

                return (
                  <div
                    key={sec.key}
                    onClick={() => setSelectedSectionKey(sec.key)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer transition ${
                      isSelected
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold">{sec.title}</p>
                      <p className={`text-[10px] ${isSelected ? "text-emerald-200" : "text-gray-400"}`}>
                        {sec.key}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {bannerCount}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionVisibility(sec);
                        }}
                        title={sec.is_visible ? "Visible on site (Click to hide)" : "Hidden from site (Click to show)"}
                        className={`h-4 w-4 rounded-full border text-[9px] flex items-center justify-center ${
                          sec.is_visible
                            ? isSelected ? "bg-emerald-400 border-white text-emerald-950" : "bg-emerald-500 border-emerald-600 text-white"
                            : "bg-gray-300 border-gray-400 text-gray-600"
                        }`}
                      >
                        {sec.is_visible ? "✓" : "×"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active section banners manager */}
          <div className="lg:col-span-3">
            {activeSection && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{activeSection.title}</h2>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold ${
                          activeSection.is_visible
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {activeSection.is_visible ? "Section Visible" : "Section Hidden"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">key: {activeSection.key}</p>
                  </div>
                  <button
                    type="button"
                    onClick={startAddBanner}
                    className="btn-primary !min-h-[36px] !px-4 text-xs font-bold"
                  >
                    + Add Slide / Banner
                  </button>
                </div>

                {activeBanners.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                    <p className="text-sm font-semibold text-gray-700">No banners in this section yet.</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Add a slide, promotion tile, or banner to display on the storefront.
                    </p>
                    <button
                      type="button"
                      onClick={startAddBanner}
                      className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      + Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeBanners.map((banner) => (
                      <div
                        key={banner.id}
                        className="flex flex-wrap items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {banner.image_url_desktop || banner.image_url_mobile ? (
                            <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white">
                              <Image
                                src={banner.image_url_desktop || banner.image_url_mobile || ""}
                                alt=""
                                fill
                                unoptimized
                                sizes="96px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-[10px] text-gray-400 font-bold">
                              TEXT TILE
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-gray-900">
                                {banner.title || "(Untitled Item)"}
                              </h3>
                              {banner.extra_text && (
                                <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
                                  {banner.extra_text}
                                </span>
                              )}
                              {!banner.is_active && (
                                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-emerald-700 hover:underline truncate max-w-sm">
                              Link: {banner.link_url || "None"}
                            </p>
                            <p className="text-[11px] text-gray-400">Order: {banner.sort_order}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={() => startEditBanner(banner)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBanner(banner)}
                            className="rounded-md border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {(addingBanner || editingBanner) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
              {editingBanner ? "Edit Slide / Banner" : `Add Slide to ${activeSection?.title}`}
            </h2>

            {saveState.error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
                {saveState.error}
              </div>
            )}

            <form action={saveAction} className="space-y-4">
              {editingBanner && <input type="hidden" name="id" value={editingBanner.id} />}
              <input type="hidden" name="section_key" value={selectedSectionKey} />

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Title / Headline
                </label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Ramadan & Eid Glow Hours"
                />
              </div>

              {/* Extra text / Discount pill */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tag / Discount Pill Text (e.g. &quot;UPTO 40% OFF&quot;)
                </label>
                <input
                  type="text"
                  name="extra_text"
                  value={extraText}
                  onChange={(e) => setExtraText(e.target.value)}
                  maxLength={80}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. UPTO 30% OFF or Limited Time Offer"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Link URL (e.g. /categories/skincare)
                </label>
                <input
                  type="text"
                  name="link_url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  maxLength={255}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="/categories/skincare or /product/slug"
                />
              </div>

              {/* Desktop Image */}
              <div>
                <BannerImageUploader
                  label="Desktop Image (Recommended 1920x600 for slider, or square for tiles)"
                  imageUrl={imageDesktop}
                  onChange={(url) => setImageDesktop(url)}
                />
                <input type="hidden" name="image_url_desktop" value={imageDesktop} />
              </div>

              {/* Mobile Image */}
              <div>
                <BannerImageUploader
                  label="Mobile Image (Optional - falls back to desktop image if empty)"
                  imageUrl={imageMobile}
                  onChange={(url) => setImageMobile(url)}
                />
                <input type="hidden" name="image_url_mobile" value={imageMobile} />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Image Alt Text (SEO)
                </label>
                <input
                  type="text"
                  name="alt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Classic Cosmetics Ramadan Banner"
                />
              </div>

              {/* Sort Order & Active */}
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
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4"
                    />
                    <span>Active on website</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="btn-secondary !min-h-[40px] !px-4 text-sm"
                  onClick={() => {
                    setAddingBanner(false);
                    setEditingBanner(null);
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
                  {savePending ? "Saving..." : editingBanner ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Banner</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-bold text-gray-900">“{deletingBanner.title || "this banner"}”</span>?
            </p>

            {deleteState.error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {deleteState.error}
              </div>
            )}

            <form action={deleteAction} className="flex justify-end gap-3 pt-2">
              <input type="hidden" name="id" value={deletingBanner.id} />
              <button
                type="button"
                className="btn-secondary !min-h-[40px] !px-4 text-sm"
                onClick={() => setDeletingBanner(null)}
                disabled={deletePending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                disabled={deletePending}
              >
                {deletePending ? "Deleting..." : "Delete Banner"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
