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
}: {
  items: UploadItem[];
  onChange: (items: UploadItem[]) => void;
  productId: string;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList) {
    setError(null);
    if (items.length + files.length > max) {
      setError(`Up to ${max} photos per product.`);
      return;
    }
    setBusy(true);
    const newItems: UploadItem[] = [...items];
    for (const file of Array.from(files)) {
      if (newItems.length >= max) break;
      const { blob, error: compressError } = await compressImage(file);
      if (compressError === "size") {
        setError("This photo could not be uploaded. Use a JPG, PNG or WebP under 5 MB and try again.");
        continue;
      }
      if (compressError === "type") {
        setError("This photo could not be uploaded. Use a JPG, PNG or WebP under 5 MB and try again.");
        continue;
      }
      const key = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const placeholder: UploadItem = {
        key,
        url: URL.createObjectURL(blob),
        path: "",
        progress: "uploading",
      };
      newItems.push(placeholder);
      onChange(newItems);

      const body = new FormData();
      body.set("productId", productId);
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
        onChange([...newItems]);
      } catch {
        placeholder.progress = "error";
        setError(
          "This photo could not be uploaded. Use a JPG, PNG or WebP under 5 MB and try again.",
        );
        onChange([...newItems]);
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

  const hasErrorItem = items.some((i) => i.progress === "error");

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
              style={{ background: "var(--blush)" }}
              unoptimized
            />
            {i === 0 ? (
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
                style={{ background: "var(--rose)", color: "var(--white)" }}
              >
                Failed
              </div>
            ) : null}
            <div
              className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1"
              style={{ background: "rgba(255,255,255,.82)" }}
            >
              <button
                type="button"
                aria-label="Move photo earlier"
                onClick={() => move(i, -1)}
                className="rounded px-1.5 py-0.5 text-xs font-bold"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Delete photo"
                onClick={() => remove(i)}
                className="rounded px-1.5 py-0.5 text-xs font-bold"
                style={{ color: "var(--rose)" }}
              >
                ✕
              </button>
              <button
                type="button"
                aria-label="Move photo later"
                onClick={() => move(i, 1)}
                className="rounded px-1.5 py-0.5 text-xs font-bold"
              >
                →
              </button>
            </div>
          </div>
        ))}
        {items.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-xl border text-sm font-semibold"
            style={{ borderColor: "var(--line)", background: "var(--blush)" }}
          >
            <span>
              {busy ? "Adding" : "+ Add"}
              <br />
              photos
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
        <p className="mt-2 text-sm font-semibold" style={{ color: hasErrorItem ? "var(--rose)" : "var(--rose)" }} role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-xs" style={{ color: "rgba(0,0,0,.68)" }}>
        The first photo becomes the cover. Use the arrows to reorder or ✕ to delete.
      </p>
    </div>
  );
}
