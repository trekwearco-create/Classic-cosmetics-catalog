import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const siteUrl = process.env.SITE_URL ?? "";
const supabaseUrl = process.env.SUPABASE_URL ?? "";

const storageHostname = (() => {
  try {
    return supabaseUrl ? new URL(supabaseUrl).hostname : "";
  } catch {
    return "";
  }
})();

const siteHostname = (() => {
  try {
    return siteUrl ? new URL(siteUrl).hostname : "";
  } catch {
    return "";
  }
})();

const CF = "https://challenges.cloudflare.com";

const buildCsp = (turnstile: boolean) =>
  [
    "default-src 'self'",
    `img-src 'self' data: blob:${storageHostname ? ` https://${storageHostname}` : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' 'unsafe-inline'${turnstile ? ` ${CF}` : ""}`,
    "font-src 'self'",
    `connect-src 'self'${turnstile ? ` ${CF}` : ""}`,
    turnstile ? `frame-src ${CF}` : "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp(false) },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  images: {
    remotePatterns: storageHostname
      ? [
          {
            protocol: "https",
            hostname: storageHostname,
            pathname: "/storage/v1/object/public/product-images/**",
          },
        ]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins:
        siteHostname && !siteHostname.startsWith("localhost")
          ? [siteHostname]
          : undefined,
    },
  },
  async headers() {
    return [
      {
        source: "/((?!admin/login).*)",
        headers: securityHeaders,
      },
      {
        source: "/admin/login",
        headers: [
          { key: "Content-Security-Policy", value: buildCsp(true) },
          ...securityHeaders.slice(1),
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
