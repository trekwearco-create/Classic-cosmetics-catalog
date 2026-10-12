import type { Metadata } from "next";

import CategoriesManager from "@/components/admin/CategoriesManager";
import { listCategoriesAdmin } from "@/lib/data-admin";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesAdmin();
  return <CategoriesManager initial={categories} />;
}
