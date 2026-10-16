import { NextResponse } from "next/server";
import { z } from "zod";

import { log } from "@/lib/log";
import { limitAction } from "@/lib/ratelimit";
import { isSameOriginRequest } from "@/lib/request-security";
import { supabasePublic } from "@/lib/supabase/server";

const cartSchema = z.object({
  lines: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        shadeId: z.string().max(100).nullable(),
      }),
    )
    .min(1)
    .max(99),
});

export async function POST(request: Request): Promise<NextResponse> {
  if (!request.headers.get("origin") || !isSameOriginRequest(request.headers)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = await limitAction("cart");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter || 60) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }
  const parsed = cartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const lines = parsed.data.lines;
  const productIds = [...new Set(lines.map((line) => line.id))];
  const supabase = supabasePublic();
  const [productsResult, imagesResult, shadesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, name, is_visible, in_stock")
      .in("id", productIds),
    supabase
      .from("product_images")
      .select("id, product_id, image_url, is_cover, sort_order")
      .in("product_id", productIds)
      .order("sort_order"),
    supabase
      .from("product_shades")
      .select("id, product_id, code, name, is_available, image_id")
      .in("product_id", productIds),
  ]);

  const queryError =
    productsResult.error ?? imagesResult.error ?? shadesResult.error;
  if (queryError) {
    log.warn("public cart verification query failed", {
      code: queryError.code,
    });
    return NextResponse.json(
      { error: "Could not verify cart" },
      { status: 500 },
    );
  }

  const productsById = new Map(
    (productsResult.data ?? []).map((product) => [product.id, product]),
  );
  const imagesById = new Map(
    (imagesResult.data ?? []).map((image) => [image.id, image.image_url]),
  );
  const coverByProduct = new Map<string, string>();
  for (const image of imagesResult.data ?? []) {
    if (image.is_cover) coverByProduct.set(image.product_id, image.image_url);
    else if (!coverByProduct.has(image.product_id)) {
      coverByProduct.set(image.product_id, image.image_url);
    }
  }
  const shadesById = new Map(
    (shadesResult.data ?? []).map((shade) => [shade.id, shade]),
  );

  return NextResponse.json(
    {
      lines: lines.map(({ id, shadeId }) => {
        const product = productsById.get(id);
        const shade = shadeId ? shadesById.get(shadeId) : null;
        const shadeMatchesProduct = !shadeId || shade?.product_id === id;
        return {
          id,
          shadeId,
          name: product?.name ?? null,
          slug: product?.slug ?? null,
          inStock: product?.is_visible === true && product.in_stock === true,
          available: shadeId === null
            ? true
            : shadeMatchesProduct && shade?.is_available === true,
          photoUrl: product ? coverByProduct.get(product.id) ?? null : null,
          shade:
            shadeId && shade && shadeMatchesProduct
              ? {
                  id: shade.id,
                  code: shade.code,
                  name: shade.name,
                  imageUrl: shade.image_id
                    ? imagesById.get(shade.image_id) ?? null
                    : null,
                }
              : null,
        };
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
