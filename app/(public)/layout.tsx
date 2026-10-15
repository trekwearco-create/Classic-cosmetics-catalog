import Header from "@/components/public/Header";
import CatalogSync from "@/components/public/CatalogSync";
import { CartProvider } from "@/components/public/CartProvider";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <CatalogSync />
      <Header />
      <div className="wrap" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {children}
      </div>
    </CartProvider>
  );
}
