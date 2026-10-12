import "server-only";

const REDACT_KEYS = [
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "token",
  "apikey",
  "secret",
  "jwt",
];

function redactEmail(value: string): string {
  const at = value.indexOf("@");
  if (at <= 0) return value;
  return `${value[0] ?? "*"}***${value.slice(at)}`;
}

function scrub(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.includes("@") && value.includes(".")) return redactEmail(value);
    if (/^eyJ[A-Za-z0-9_-]{10,}/.test(value)) return "[redacted-jwt]";
    return value;
  }
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = REDACT_KEYS.includes(k.toLowerCase()) ? "[redacted]" : scrub(v);
    }
    return out;
  }
  return value;
}

export const log = {
  info(message: string, meta?: unknown) {
    console.log(`[classic-cosmetics] ${message}`, meta === undefined ? "" : scrub(meta));
  },
  warn(message: string, meta?: unknown) {
    console.warn(`[classic-cosmetics] ${message}`, meta === undefined ? "" : scrub(meta));
  },
  error(message: string, meta?: unknown) {
    console.error(`[classic-cosmetics] ${message}`, meta === undefined ? "" : scrub(meta));
  },
};
