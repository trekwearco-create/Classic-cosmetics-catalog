import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductView from "@/components/public/ProductView";
import { getProductBySlug } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return { title: "Product | Classic Cosmetics" };
  }
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product | Classic Cosmetics" };
  }

  const title = `${product.name || "Product"} | Classic Cosmetics`;
  const description = product.description?.slice(0, 150) ?? "Elegance in Every Detail";
  const coverImage = product.images?.[0]?.url;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: coverImage ? [{ url: coverImage, alt: product.name || "Product" }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: coverImage ? [coverImage] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!slug || typeof slug !== "string") {
    notFound();
  }

  const product = await getProductBySlug(slug);
  if (!product || !product.id) {
    notFound();
  }

  return <ProductView product={product} />;
}
