import "server-only";

import { env } from "@/lib/env";

export async function verifyTurnstile(
  token: string | null,
  ip?: string,
): Promise<boolean> {
  if (!token) return false;
  const body = new URLSearchParams({
    secret: env().TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
