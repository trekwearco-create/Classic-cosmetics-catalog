import type { Metadata } from "next";

import ProductForm from "@/components/admin/ProductForm";
import { listCategoriesAdmin, listBrandsAdmin } from "@/lib/data-admin";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    listCategoriesAdmin(),
    listBrandsAdmin(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Add product
      </h1>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, parent_id: c.parent_id ?? null }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        isNew
        initial={{
          id: crypto.randomUUID(),
          name: "",
          slug: "",
          description: "",
          price: null,
          discount_price: null,
          is_visible: true,
          in_stock: true,
          category_id: "",
          category_ids: [],
          brand_id: "",
          images: [],
          shades: [],
        }}
      />
    </div>
  );
}
