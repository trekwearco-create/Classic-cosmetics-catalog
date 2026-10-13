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

  async function upload(files: FileList) {
    setError(null);
    const singleImage = purpose === "shade";
    if (
      (singleImage && files.length > 1) ||
      (!singleImage && items.length + files.length > max)
    ) {
      setError(`Up to ${max} photos per product.`);
      return;
    }
    setBusy(true);
    const newItems: UploadItem[] = singleImage ? [] : [...items];
    const previousItems = items;
    for (const file of Array.from(files)) {
      if (newItems.length >= max) break;
      const { blob, error: compressError } = await compressImage(file);
      if (compressError) {
        setError("Use a JPG, PNG or WebP image under 5 MB.");
        continue;
      }
      const key = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const placeholder: UploadItem = {
        key,
        url: URL.createObjectURL(blob),
        path: "",
        progress: "uploading",
      };
      if (!singleImage) {
        newItems.push(placeholder);
        onChange(newItems);
      }

      const body = new FormData();
      body.set("productId", productId);
      body.set("purpose", purpose);
      body.set("file", new File([blob], "photo.webp", { type: "image/webp" }));

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body,
          headers: { "Cache-Control": "no-store" },
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { url: string; path: string };
        placeholder.url = json.url;
        placeholder.path = json.path;
        placeholder.progress = "done";
        onChange(singleImage ? [placeholder] : [...newItems]);
      } catch {
        placeholder.progress = "error";
        setError("This photo could not be uploaded. Please try again.");
        onChange(singleImage ? previousItems : [...newItems]);
      }
    }
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
                className="absolute left-1.5 top-1.5 rounded px-1.5 py-1 text-[10px] font-bold"
                style={{ background: "var(--ink)", color: "var(--white)" }}
              >
                Cover
              </span>
            ) : null}
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
            <div
              className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1"
              style={{ background: "rgba(255,255,255,.82)" }}
            >
              {purpose === "product" ? (
                <button
                  type="button"
                  aria-label="Move photo earlier"
                  onClick={() => move(i, -1)}
                  disabled={busy}
                  className="rounded px-1.5 py-0.5 text-xs font-bold"
                >
                  ←
                </button>
              ) : null}
              <button
                type="button"
                aria-label={purpose === "shade" ? "Remove shade photo" : "Delete photo"}
                onClick={() => remove(i)}
                disabled={busy}
                className="rounded px-1.5 py-0.5 text-xs font-bold"
                style={{ color: "var(--brick)" }}
              >
                ✕
              </button>
              {purpose === "product" ? (
                <button
                  type="button"
                  aria-label="Move photo later"
                  onClick={() => move(i, 1)}
                  disabled={busy}
                  className="rounded px-1.5 py-0.5 text-xs font-bold"
                >
                  →
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {items.length < max || purpose === "shade" ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-xl border text-sm font-semibold"
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
        accept="image/jpeg,image/png,image/webp"
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
          : "The first photo becomes the cover. Use the arrows to reorder or ✕ to delete."}
      </p>
    </div>
  );
}
