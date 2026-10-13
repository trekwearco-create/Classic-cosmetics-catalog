import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieUpdate = { name: string; value: string; options: CookieOptions };

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let cookieUpdates: CookieUpdate[] = [];
  let authHeaders: Record<string, string> = {};

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        cookieUpdates = list;
        authHeaders = headers;
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, secureCookieOptions(options)),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user && request.nextUrl.pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      cookieUpdates.forEach(({ name, value, options }) =>
        redirectResponse.cookies.set(name, value, secureCookieOptions(options)),
      );
      Object.entries(authHeaders).forEach(([key, value]) =>
        redirectResponse.headers.set(key, value),
      );
      return redirectResponse;
    }
  }

  return response;
}

function secureCookieOptions(options: CookieOptions) {
  return {
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
