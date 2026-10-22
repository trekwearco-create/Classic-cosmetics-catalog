"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { compressImage } from "@/lib/image-compress";

export default function BannerImageUploader({
  label = "Banner image",
  imageUrl,
  onChange,
}: {
  label?: string;
  imageUrl: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    const { blob, error: compressError } = await compressImage(file);
    if (compressError) {
      setError("Choose a JPG, PNG or WebP image under 5 MB.");
      return;
    }

    setBusy(true);
    const body = new FormData();
    body.set("purpose", "banner");
    body.set("file", new File([blob], "banner.webp", { type: "image/webp" }));
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
        headers: { "Cache-Control": "no-store" },
      });
      if (!response.ok) throw new Error("upload failed");
      const result = (await response.json()) as { url: string };
      onChange(result.url);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {imageUrl ? (
            <Image src={imageUrl} alt="Banner preview" fill unoptimized sizes="128px" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center px-2 text-center text-[11px] text-gray-400">
              No image
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Uploading..." : imageUrl ? "Replace" : "Upload"}
          </button>
          {imageUrl && (
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              disabled={busy}
              onClick={() => onChange("")}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
