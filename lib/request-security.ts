export function isSameOriginRequest(headers: Pick<Headers, "get">): boolean {
  const origin = headers.get("origin");
  const host =
    headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headers.get("host");
  const protocol =
    headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  if (!origin || !host) return false;

  try {
    const parsedOrigin = new URL(origin);
    return (
      parsedOrigin.origin !== "null" &&
      parsedOrigin.host.toLowerCase() === host.toLowerCase() &&
      parsedOrigin.protocol === `${protocol.replace(/:$/, "")}:`
    );
  } catch {
    return false;
  }
}
