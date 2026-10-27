"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { compressImage } from "@/lib/image-compress";

export type UploadItem = {
  key: string;
  url: string;
  path: string;
  progress: "done" | "uploading" | "error";
};

export default function ImageUploader({
  items,
  onChange,
  productId,
  max = 12,
  purpose = "product",
}: {
  items: UploadItem[];
  onChange: (items: UploadItem[]) => void;
  productId: string;
  max?: number;
  purpose?: "product" | "shade";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deletedKeysRef = useRef<Set<string>>(new Set());

  async function upload(files: FileList) {
    setError(null);
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    const singleImage = purpose === "shade";
    if (
      (singleImage && fileArray.length > 1) ||
      (!singleImage && items.length + fileArray.length > max)
    ) {
      setError(`Up to ${max} photos per product.`);
      return;
    }

    setBusy(true);

    const allowedFiles = fileArray.slice(0, singleImage ? 1 : max - items.length);
    const placeholders: UploadItem[] = allowedFiles.map((file) => ({
      key: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(file),
      path: "",
      progress: "uploading",
    }));

    let currentItems: UploadItem[] = singleImage ? placeholders : [...items, ...placeholders];
    onChange(currentItems);

    await Promise.all(
      allowedFiles.map(async (file, idx) => {
        const placeholder = placeholders[idx]!;
        try {
          const { blob, error: compressError } = await compressImage(file);
          if (compressError) {
            if (deletedKeysRef.current.has(placeholder.key)) return;
            currentItems = currentItems.map((it) =>
              it.key === placeholder.key ? { ...it, progress: "error" } : it,
            );
            onChange([...currentItems]);
            return;
          }

          const body = new FormData();
          body.set("productId", productId);
          body.set("purpose", purpose);
          body.set("file", new File([blob], "photo.webp", { type: "image/webp" }));

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body,
            headers: { "Cache-Control": "no-store" },
          });

          if (!res.ok) throw new Error(String(res.status));
          const json = (await res.json()) as { url: string; path: string };

          if (deletedKeysRef.current.has(placeholder.key)) return;
          currentItems = currentItems.map((it) =>
            it.key === placeholder.key
              ? { ...it, url: json.url, path: json.path, progress: "done" }
              : it,
          );
          onChange([...currentItems]);
        } catch {
          if (deletedKeysRef.current.has(placeholder.key)) return;
          currentItems = currentItems.map((it) =>
            it.key === placeholder.key ? { ...it, progress: "error" } : it,
          );
          setError("One or more photos could not be uploaded. Please try again.");
          onChange([...currentItems]);
        }
      }),
    );

    setBusy(false);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }

  function remove(index: number) {
    const item = items[index];
    if (item) {
      deletedKeysRef.current.add(item.key);
    }
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="relative aspect-square overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--line)" }}
          >
            <Image
              src={item.url}
              alt={`Photo ${i + 1}`}
              width={320}
              height={320}
              className="h-full w-full object-contain"
              style={{ background: "var(--linen)" }}
              unoptimized
            />
            {purpose === "product" && i === 0 ? (
              <span
                className="absolute left-1.5 top-1.5 z-10 rounded bg-[#0C3B25] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs tracking-wide"
              >
                Cover Photo
              </span>
            ) : null}
            <button
              type="button"
              aria-label={purpose === "shade" ? "Remove shade photo" : "Delete photo"}
              onClick={() => remove(i)}
              disabled={busy}
              className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors text-[10px] font-bold shadow"
            >
              ✕
            </button>
            {item.progress === "uploading" ? (
              <div className="absolute inset-0 grid place-items-center text-xs font-semibold" style={{ background: "rgba(255,255,255,.7)" }}>
                Uploading
              </div>
            ) : null}
            {item.progress === "error" ? (
              <div
                className="absolute inset-x-0 bottom-0 p-1 text-center text-[10px] font-semibold"
                style={{ background: "var(--brick)", color: "var(--white)" }}
              >
                Failed
              </div>
            ) : null}
            {purpose === "product" ? (
              <div
                className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1"
                style={{ background: "rgba(255,255,255,.82)" }}
              >
                <button
                  type="button"
                  aria-label="Move photo earlier"
                  onClick={() => move(i, -1)}
                  disabled={busy}
                  className="rounded px-1.5 py-0.5 text-xs font-bold"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Move photo later"
                  onClick={() => move(i, 1)}
                  disabled={busy}
                  className="rounded px-1.5 py-0.5 text-xs font-bold"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {items.length < max || purpose === "shade" ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-xl border text-sm font-semibold hover:border-gray-400 transition-colors"
            style={{ borderColor: "var(--line)", background: "var(--linen)" }}
          >
            <span>
              {busy ? "Uploading" : purpose === "shade" && items.length > 0 ? "Replace" : "+ Add"}
              <br />
              {purpose === "shade" ? "shade photo" : "photos"}
            </span>
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            void upload(e.target.files);
          }
          e.target.value = "";
        }}
      />
      {error ? (
        <p className="mt-2 text-sm font-semibold" style={{ color: "var(--brick)" }} role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-xs" style={{ color: "var(--ink-2)" }}>
        {purpose === "shade"
          ? "Upload a separate photo for this shade. Replacing or removing it takes effect when the product is saved."
          : "The first photo automatically becomes the Cover Photo. Select multiple images at once to batch upload. Use ✕ to delete or arrows to reorder."}
      </p>
    </div>
  );
}
