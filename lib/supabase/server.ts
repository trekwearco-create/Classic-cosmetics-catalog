import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

let publicClient: SupabaseClient | null = null;

export const supabasePublic = (): SupabaseClient => {
  if (!publicClient) {
    const e = env();
    publicClient = createClient(e.SUPABASE_URL, e.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
};

export const supabaseServer = async (): Promise<SupabaseClient> => {
  const store = await cookies();
  const e = env();
  return createServerClient(e.SUPABASE_URL, e.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            store.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            }),
          );
        } catch {
          // called from a server component: nothing to persist
        }
      },
    },
  });
};

export const isAdmin = async (): Promise<boolean> => {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    logError("admin check failed", error.code);
    return false;
  }
  return data === true;
};

function logError(context: string, code: string | undefined) {
  console.error(
    `[classic-cosmetics] ${context}${code ? ` (${code})` : ""}`,
  );
}
