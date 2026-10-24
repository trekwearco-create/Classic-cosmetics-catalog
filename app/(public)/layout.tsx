import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PromoStrip from "@/components/public/PromoStrip";
import CartDrawer from "@/components/public/CartDrawer";
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
      <div id="main-content" className="min-h-[70vh] overflow-x-hidden w-full max-w-full">
        {children}
      </div>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
