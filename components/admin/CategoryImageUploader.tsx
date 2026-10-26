"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { compressImage } from "@/lib/image-compress";

export default function CategoryImageUploader({
  imageUrl,
  onChange,
}: {
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
    body.set("purpose", "category");
    body.set("file", new File([blob], "category.webp", { type: "image/webp" }));
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
      setError("The category image could not be uploaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-full box-border">
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category image</span>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border bg-linen box-border" style={{ borderColor: "var(--line)" }}>
          {imageUrl ? (
            <Image src={imageUrl} alt="Category preview" fill unoptimized sizes="80px" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center px-2 text-center text-[10px] sm:text-xs" style={{ color: "var(--ink-2)" }}>
              No image
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary !min-h-0 p-2.5 text-xs"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? "Uploading" : imageUrl ? "Replace image" : "Add image"}
          </button>
          {imageUrl ? (
            <button
              className="btn-danger !min-h-0 p-2.5 text-xs"
              type="button"
              onClick={() => onChange("")}
              disabled={busy}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      {error ? <p className="text-xs font-semibold" role="alert" style={{ color: "var(--brick)" }}>{error}</p> : null}
      <p className="text-xs text-gray-500">JPG, PNG or WebP; 5 MB maximum before compression.</p>
    </div>
  );
}
