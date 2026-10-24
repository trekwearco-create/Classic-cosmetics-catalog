import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/supabase/server";
import { listProductsAdmin } from "@/lib/data-admin";
import KoreanProductsManager from "@/components/admin/KoreanProductsManager";

export const metadata = {
  title: "Korean Beauty Products | Admin",
};

export default async function KoreanProductsAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const products = await listProductsAdmin();

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      <KoreanProductsManager initialProducts={products} />
    </div>
  );
}
