import type { Metadata } from "next";
import Link from "next/link";

import { supabasePublic } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const supabase = supabasePublic();

  const [productsRes, categoriesRes, hiddenRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_visible", false),
  ]);

  const total = productsRes.count ?? 0;
  const categories = categoriesRes.count ?? 0;
  const hidden = hiddenRes.count ?? 0;

  const stats = [
    { label: "Products", value: total },
    { label: "Categories", value: categories },
    { label: "Hidden products", value: hidden },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm" style={{ color: "rgba(0,0,0,.68)" }}>
              {s.label}
            </p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn-primary">
          Add product
        </Link>
        <Link href="/admin/categories" className="btn-secondary">
          Add category
        </Link>
      </div>
    </div>
  );
}
