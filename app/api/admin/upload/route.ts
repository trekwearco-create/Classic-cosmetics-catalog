import { headers } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";

import { log } from "@/lib/log";
import { limitUpload } from "@/lib/ratelimit";
import { isAdmin, supabaseServer } from "@/lib/supabase/server";

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_PIXELS = 25_000_000;
const MAX_PHOTOS = 12;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function detectMimeType(buf: Uint8Array): string | null {
  const b = buf;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b.subarray(8, 12).every((v, i) => v === [0x57, 0x45, 0x42, 0x50][i])
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const siteUrl = process.env.SITE_URL;
  if (
    !origin ||
    !siteUrl ||
    !sameSite(origin, siteUrl)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await limitUpload("upload");
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const purpose = z.enum(["product", "shade", "category"]).safeParse(
    form.get("purpose") ?? "product",
  );
  if (!purpose.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const productId =
    purpose.data === "category"
      ? null
      : z.string().uuid().safeParse(form.get("productId"));
  if (productId && !productId.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 415 });
  }

  const buf = new Uint8Array(await file.arrayBuffer());
  const realType = detectMimeType(buf);
  if (!realType || !ALLOWED_MIME.has(realType)) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 415 });
  }

  const supabase = await supabaseServer();
  if (productId) {
    const { data: productImages, error: countError } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId.data);
    if (countError) {
      log.warn("upload image count failed", { code: countError.code });
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const existingStored = await supabase.storage
      .from("product-images")
      .list(`products/${productId.data}`);
    if (existingStored.error) {
      log.warn("upload storage listing failed", { code: existingStored.error.name });
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const storedCount =
      (existingStored.data ?? []).filter((f) => f.name !== "").length;
    const galleryImageCount = (productImages ?? []).filter(
      (image) => !image.storage_path.includes("/shades/"),
    ).length;
    if (purpose.data === "product" && galleryImageCount >= MAX_PHOTOS) {
      return NextResponse.json({ error: "Too many photos" }, { status: 422 });
    }
    if (purpose.data === "product" && storedCount >= MAX_PHOTOS + 4) {
      return NextResponse.json({ error: "Too many photos" }, { status: 422 });
    }
  }

  let out: Buffer;
  try {
    out = await sharp(Buffer.from(buf), { limitInputPixels: MAX_PIXELS })
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    log.error("upload re-encode failed", {
      code: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ error: "Unsupported image" }, { status: 415 });
  }

  const path =
    purpose.data === "category"
      ? `categories/${crypto.randomUUID()}.webp`
      : `products/${productId?.data}/${purpose.data === "shade" ? "shades/" : ""}${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, out, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (uploadError) {
    log.error("upload to storage failed", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const publicUrl = new URL(
    `/storage/v1/object/public/product-images/${path}`,
    supabaseUrl,
  ).toString();

  return NextResponse.json({ url: publicUrl, path });
}

function sameSite(origin: string, siteUrl: string): boolean {
  try {
    return new URL(origin).host === new URL(siteUrl).host;
  } catch {
    return false;
  }
}
