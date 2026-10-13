import Header from "@/components/public/Header";
import CatalogSync from "@/components/public/CatalogSync";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <CatalogSync />
      <Header />
      <div className="wrap" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {children}
      </div>
    </>
  );
}
