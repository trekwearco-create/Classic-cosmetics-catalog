import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/ProductForm";
import { getProductAdmin, listCategoriesAdmin } from "@/lib/data-admin";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) notFound();

  const [product, categories] = await Promise.all([
    getProductAdmin(id),
    listCategoriesAdmin(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-2 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Edit product
      </h1>
      <p className="mb-6 text-sm" style={{ color: "rgba(0,0,0,.68)" }}>
        Public page: <Link href={`/product/${product.slug}`}>/product/{product.slug}</Link>
      </p>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        isNew={false}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: String(product.price),
          discount_price:
            product.discount_price === null ? "" : String(product.discount_price),
          is_visible: product.is_visible,
          in_stock: product.in_stock,
          category_id: product.category_id,
          images: product.images.map((img) => ({
            key: img.id,
            url: img.url,
            path: img.storage_path,
            progress: "done" as const,
          })),
          shades: product.shades.map((s) => ({
            key: s.id,
            code: s.code ?? "",
            name: s.name,
            color_hex: s.color_hex ?? "",
            is_available: s.is_available,
          })),
        }}
      />
    </div>
  );
}
