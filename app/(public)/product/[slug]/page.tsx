import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductView from "@/components/public/ProductView";
import { getProductBySlug } from "@/lib/data";
import { env } from "@/lib/env";
import { productLinkPath } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const title = product
    ? `${product.name} | Classic Cosmetics`
    : "Product | Classic Cosmetics";
  const description = product?.description?.slice(0, 150) ?? "Elegance in Every Detail";
  const productUrl = new URL(
    productLinkPath(product?.slug ?? slug),
    env().SITE_URL,
  ).toString();
  const imageUrl = new URL(
    `${productLinkPath(product?.slug ?? slug)}/og`,
    env().SITE_URL,
  ).toString();

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: productUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product ? `${product.name} product photo` : "Classic Cosmetics",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return <ProductView product={product} />;
}
