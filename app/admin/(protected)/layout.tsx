import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
