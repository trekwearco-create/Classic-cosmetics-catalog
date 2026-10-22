import { z } from "zod";

const schema = z.object({
  SUPABASE_URL: z.string().url().optional().default(""),
  SUPABASE_ANON_KEY: z.string().min(20).optional().default(""),
  SITE_URL: z.string().url().optional().default(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  ),
  WHATSAPP_NUMBER: z.string().regex(/^\d{6,15}$/).optional().default("923222495034"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional().default(""),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional().default(""),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional().default(""),
});

type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SITE_URL:
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER ?? "923222495034",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => String(i.path[0] ?? ""))
      .filter(Boolean);
    throw new Error(
      `Missing or invalid environment variables: ${missing.join(", ")}. Set them in .env.local and in Vercel without printing their values.`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function validateSupabaseEnv(): { url: string; anonKey: string } {
  const missing: string[] = [];
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url) missing.push("SUPABASE_URL");
  if (!anonKey) missing.push("SUPABASE_ANON_KEY");
  if (missing.length > 0) {
    throw new Error(
      `Missing or invalid environment variables: ${missing.join(", ")}. Set them in .env.local and in Vercel without printing their values.`,
    );
  }
  return { url: url!, anonKey: anonKey! };
}

export function turnstileEnabled(): boolean {
  const e = env();
  return e.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== "" && e.TURNSTILE_SECRET_KEY !== "";
}

export function rateLimitEnabled(): boolean {
  const e = env();
  return e.UPSTASH_REDIS_REST_URL !== "" && e.UPSTASH_REDIS_REST_TOKEN !== "";
}
