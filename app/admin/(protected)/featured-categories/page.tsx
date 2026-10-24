import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/server";
import { listCategoriesAdmin } from "@/lib/data-admin";
import FeaturedCategoriesManager from "@/components/admin/FeaturedCategoriesManager";

export const metadata = {
  title: "Shop by Categories (Homepage) | Admin",
};

export default async function FeaturedCategoriesAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const categories = await listCategoriesAdmin();

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      <FeaturedCategoriesManager initialCategories={categories} />
    </div>
  );
}
