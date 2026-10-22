import Header from "@/components/public/Header";
import PromoStrip from "@/components/public/PromoStrip";
import CatalogSync from "@/components/public/CatalogSync";
import { CartProvider } from "@/components/public/CartProvider";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <CatalogSync />
      {/* Promo strip sits above the sticky header */}
      <PromoStrip />
      <Header />
      <main id="main-content">
        {children}
      </main>
    </CartProvider>
  );
}
