import type { Metadata } from "next";

import BrandsManager from "@/components/admin/BrandsManager";
import { listBrandsAdmin } from "@/lib/data-admin";

export const metadata: Metadata = {
  title: "Brands Management | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBrandsPage() {
  const brands = await listBrandsAdmin();

  return (
    <div className="w-full px-2 sm:px-4 py-2">
      <BrandsManager initial={brands} />
    </div>
  );
}
