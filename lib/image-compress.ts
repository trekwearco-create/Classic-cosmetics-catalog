"use client";

const MAX_SIDE = 1600;
const QUALITY = 0.82;
const MAX_INPUT_BYTES = 5 * 1024 * 1024;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CompressResult = { blob: Blob; error?: string };

export async function compressImage(file: File): Promise<CompressResult> {
  if (!ALLOWED.has(file.type)) {
    return { blob: file, error: "type" };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { blob: file, error: "size" };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, error: "unknown" };
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", QUALITY),
    );
    if (!blob) return { blob: file, error: "unknown" };
    return { blob };
  } catch {
    return { blob: file, error: "unknown" };
  }
}

export const compressConfig = { MAX_SIDE, QUALITY, MAX_INPUT_BYTES, ALLOWED };
