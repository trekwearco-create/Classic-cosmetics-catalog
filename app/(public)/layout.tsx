import Header from "@/components/public/Header";
import PromoStrip from "@/components/public/PromoStrip";
import CatalogSync from "@/components/public/CatalogSync";
import { CartProvider } from "@/components/public/CartProvider";
import { listCategoryTree, getMenuLinks } from "@/lib/data";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [tree, links] = await Promise.all([
    listCategoryTree(),
    getMenuLinks(),
  ]);

  return (
    <CartProvider>
      <CatalogSync />
      {/* Promo strip sits above the sticky header */}
      <PromoStrip />
      <Header categoryTree={tree} menuLinks={links} />
      <main id="main-content">
        {children}
      </main>
    </CartProvider>
  );
}
