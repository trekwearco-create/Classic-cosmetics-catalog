export const turnstileConfig = {
  enabled:
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== undefined &&
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== "",
  siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
};
