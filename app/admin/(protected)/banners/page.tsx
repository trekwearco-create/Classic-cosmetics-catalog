import type { Metadata } from "next";

import BannersManager from "@/components/admin/BannersManager";
import { listBannersAdmin, listHomeSectionsAdmin } from "@/lib/data-admin";

export const metadata: Metadata = {
  title: "Banners & Home Sections",
  robots: { index: false, follow: false },
};

export default async function AdminBannersPage() {
  const [sections, banners] = await Promise.all([
    listHomeSectionsAdmin(),
    listBannersAdmin(),
  ]);

  return <BannersManager initialSections={sections} initialBanners={banners} />;
}
