import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Header from "@/components/public/Header";
import { buildWhatsAppUrl, productLinkPath } from "@/lib/whatsapp";
import { getProductBySlug } from "@/lib/data";

export const metadata: Metadata = {
  title: "%s | Classic Cosmetics",
  description: "Elegance in Every Detail",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = product.discount_price ?? product.price;
  const percent =
    product.discount_price !== null && product.discount_price < product.price
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;

  const message = buildWhatsAppUrl({
    name: product.name,
    shade: product.shades[0]?.code
      ? `${product.shades[0].code} ${product.shades[0].name}`
      : undefined,
    price,
    productPath: productLinkPath(product.slug),
  });

  return (
    <>
      <Header />
      <div className="wrap" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <main className="flex flex-col gap-6" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold" style={{ color: "rgba(0,0,0,.68)" }}>
                {product.category_name}
              </p>
              <h1 className="text-xl font-bold leading-tight md:text-3xl">{product.name}</h1>
            </div>
            <p className="text-2xl font-bold" style={{ fontWeight: 700 }}>
              Rs. {price.toLocaleString("en-US", {
                minimumFractionDigits: price % 1 !== 0 ? 2 : 0,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {product.discount_price !== null ? (
            <p className="text-lg" style={{ color: "rgba(0,0,0,.68)" }}>
              <s>Rs. {product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</s>
              <span className="ml-2 font-bold text-rose">{percent}% OFF</span>
            </p>
          ) : null}

          {product.description ? (
            <p className="leading-relaxed" style={{ color: "rgba(0,0,0,.86)" }}>
              {product.description}
            </p>
          ) : null}

          {product.shades.length > 0 ? (
            <div className="card p-4">
              <p className="text-sm font-semibold" style={{ color: "rgba(0,0,0,.68)" }}>Shade</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.shades.map((shade) => (
                  <span
                    key={shade.id}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      shade.is_available
                        ? "bg-white border border-black/30"
                        : "bg-blush opacity-60"
                    }`}
                    style={{
                      color: shade.is_available ? "var(--ink)" : "var(--ink-2)",
                      cursor: shade.is_available ? "pointer" : "not-allowed",
                    }}
                    title={shade.is_available ? "Select this shade" : "Unavailable"}
                  >
                    {shade.code ? `${shade.code} ` : ""}
                    {shade.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-center">
            <a
              href={message}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`Order ${product.name} on WhatsApp`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9 7.8c.2 3 2.7 5.5 5.7 5.7l1.3-1.3-2-1.2-.9.8a4.4 4.4 0 0 1-1.8-1.8l.8-.9-1.2-2z" fill="#000" />
              </svg>
              Order on WhatsApp
            </a>
          </div>
        </main>
      </div>
    </>
  );
}
