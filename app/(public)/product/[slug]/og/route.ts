import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { supabasePublic } from "@/lib/supabase/server";

const STORAGE_PREFIX = "/storage/v1/object/public/product-images/";
const MAX_SOURCE_BYTES = 3 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 300_000;
const MAX_INPUT_PIXELS = 25_000_000;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function storageUrl(storagePath: string): URL | null {
  const parts = storagePath.split("/");
  const hasShadeDirectory = parts[2] === "shades";
  const expectedLength = hasShadeDirectory ? 4 : 3;
  if (
    parts.length !== expectedLength ||
    parts[0] !== "products" ||
    !/^[0-9a-f-]{36}$/i.test(parts[1] ?? "") ||
    parts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))
  ) {
    return null;
  }

  const base = new URL(env().SUPABASE_URL);
  return new URL(
    `${STORAGE_PREFIX}${parts.map(encodeURIComponent).join("/")}`,
    base.origin,
  );
}

async function readCoverImage(storagePath: string): Promise<Buffer> {
  const url = storageUrl(storagePath);
  if (!url) throw new Error("Invalid product image storage path");

  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Product image request failed");

  const contentLength = Number(response.headers.get("content-length"));
  if (contentLength > MAX_SOURCE_BYTES) {
    throw new Error("Product image exceeds the source size limit");
  }

  const image = Buffer.from(await response.arrayBuffer());
  if (image.byteLength > MAX_SOURCE_BYTES) {
    throw new Error("Product image exceeds the source size limit");
  }
  return image;
}

async function makeJpeg(source: Buffer): Promise<Buffer> {
  const metadata = await sharp(source, {
    limitInputPixels: MAX_INPUT_PIXELS,
  }).metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
    throw new Error("Unsupported product image format");
  }

  for (const width of [1200, 900, 600]) {
    const height = Math.round((width * 630) / 1200);
    for (const quality of [80, 70, 60, 50, 40]) {
      const jpeg = await sharp(source, {
        limitInputPixels: MAX_INPUT_PIXELS,
      })
        .rotate()
        .resize(width, height, {
          fit: "contain",
          background: "#ffffff",
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      if (jpeg.byteLength < MAX_OUTPUT_BYTES) return jpeg;
    }
  }

  throw new Error("Product Open Graph image exceeds the output size limit");
}

function jpegResponse(image: Buffer): Response {
  return new Response(new Uint8Array(image), {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Length": String(image.byteLength),
      "Content-Type": "image/jpeg",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<Response> {
  try {
    const { slug } = await params;
    const supabase = supabasePublic();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .eq("is_visible", true)
      .maybeSingle();

    if (productError) {
      log.error("Open Graph product lookup failed", { code: productError.code });
      return new Response("Unable to load product image", { status: 500 });
    }
    if (!product) return new Response("Not found", { status: 404 });

    const { data: cover, error: coverError } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", product.id)
      .eq("is_cover", true)
      .maybeSingle();

    if (coverError) {
      log.error("Open Graph cover lookup failed", { code: coverError.code });
      return new Response("Unable to load product image", { status: 500 });
    }

    const source = cover
      ? await readCoverImage(cover.storage_path)
      : await readFile(join(process.cwd(), "public", "logo.png"));
    return jpegResponse(await makeJpeg(source));
  } catch {
    log.error("Open Graph image generation failed");
    return new Response("Unable to generate product image", { status: 500 });
  }
}
