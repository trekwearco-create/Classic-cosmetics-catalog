import type { Metadata } from "next";
import Script from "next/script";

import { turnstileConfig } from "@/lib/turnstile-config";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      {turnstileConfig.enabled ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      ) : null}
      <LoginForm turnstileEnabled={turnstileConfig.enabled} />
    </main>
  );
}
