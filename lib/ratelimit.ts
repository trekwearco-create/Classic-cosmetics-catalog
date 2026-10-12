import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { rateLimitEnabled } from "@/lib/env";

let productLimiter: Ratelimit | null = null;
let loginLimiter: Ratelimit | null = null;
let uploadLimiter: Ratelimit | null = null;
let actionLimiter: Ratelimit | null = null;

function init() {
  if (productLimiter || !rateLimitEnabled()) return;
  const redis = Redis.fromEnv();
  productLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "cc:products",
  });
  loginLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "cc:login",
  });
  uploadLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "cc:upload",
  });
  actionLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "cc:action",
  });
}

export type LimitResult = { allowed: boolean; retryAfter: number };

export async function limitProducts(): Promise<LimitResult> {
  init();
  if (!productLimiter) return { allowed: true, retryAfter: 0 };
  const r = await productLimiter.limit("public");
  return { allowed: r.success, retryAfter: Math.ceil(r.reset / 1000) };
}

export async function limitLogin(subject: string): Promise<LimitResult> {
  init();
  if (!loginLimiter) return { allowed: true, retryAfter: 0 };
  const r = await loginLimiter.limit(subject);
  return { allowed: r.success, retryAfter: Math.ceil(r.reset / 1000) };
}

export async function limitUpload(subject: string): Promise<LimitResult> {
  init();
  if (!uploadLimiter) return { allowed: true, retryAfter: 0 };
  const r = await uploadLimiter.limit(subject);
  return { allowed: r.success, retryAfter: Math.ceil(r.reset / 1000) };
}

export async function limitAction(subject: string): Promise<LimitResult> {
  init();
  if (!actionLimiter) return { allowed: true, retryAfter: 0 };
  const r = await actionLimiter.limit(subject);
  return { allowed: r.success, retryAfter: Math.ceil(r.reset / 1000) };
}
