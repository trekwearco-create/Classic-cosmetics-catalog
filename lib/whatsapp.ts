import "server-only";

import { env } from "@/lib/env";

function normalizeNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
}

export function normalizeWhatsAppNumber(raw: string): string {
  return normalizeNumber(raw);
}

export function buildWhatsAppUrl(input: {
  name: string;
  shade?: string;
  productPath: string;
}): string {
  const raw = normalizeNumber(env().WHATSAPP_NUMBER);
  const lines = [
    "Assalam o Alaikum, I want to order:",
    `Product: ${input.name}`,
    ...(input.shade ? [`Shade: ${input.shade}`] : []),
    `Link: ${new URL(input.productPath, env().SITE_URL).toString()}`,
  ];
  return `https://wa.me/${raw}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function productLinkPath(slug: string): string {
  return `/product/${slug}`;
}
