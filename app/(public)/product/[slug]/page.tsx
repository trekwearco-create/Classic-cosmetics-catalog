import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductView from "@/components/public/ProductView";
import { getProductBySlug } from "@/lib/data";
import { buildWhatsAppUrl, productLinkPath } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.description ?? "Elegance in Every Detail",
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = product.discount_price ?? product.price;
  const productPath = productLinkPath(product.slug);
  const orderUrl = buildWhatsAppUrl({
    name: product.name,
    price,
    productPath,
  });
  const shadeOrderUrls = Object.fromEntries(
    product.shades.map((shade) => [
      shade.id,
      buildWhatsAppUrl({
        name: product.name,
        shade: `${shade.code ? `${shade.code} ` : ""}${shade.name}`,
        price,
        productPath,
      }),
    ]),
  );

  return (
    <ProductView
      product={product}
      orderUrl={orderUrl}
      shadeOrderUrls={shadeOrderUrls}
    />
  );
}
