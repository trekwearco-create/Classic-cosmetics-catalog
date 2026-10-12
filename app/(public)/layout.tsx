import Header from "@/components/public/Header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <div className="wrap" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {children}
      </div>
    </>
  );
}
