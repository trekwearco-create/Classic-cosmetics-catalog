import { NextResponse } from "next/server";

import { limitProducts } from "@/lib/ratelimit";
import { searchProductCards } from "@/lib/data";

export async function GET(request: Request): Promise<NextResponse> {
  const limit = await limitProducts();
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter || 60) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 60);
  const category = (searchParams.get("category") ?? "").slice(0, 80);
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1
      ? Math.min(Math.floor(pageRaw), 200)
      : 1;

  try {
    const products = await searchProductCards({ q, category, page });
    return NextResponse.json(
      {
        products: products.map((p) => ({
          slug: p.slug,
          name: p.name,
          category_name: p.category_name,
          price: p.price,
          discount_price: p.discount_price,
          in_stock: p.in_stock,
          cover_url: p.cover_url,
          shade_colors: p.shade_colors,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
