"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { turnstileEnabled } from "@/lib/env";
import { log } from "@/lib/log";
import { limitLogin } from "@/lib/ratelimit";
import { supabaseServer } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";

const LOGIN_ERROR = "Email or password is incorrect.";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const siteUrl = process.env.SITE_URL;
  if (origin && siteUrl && new URL(origin).host !== new URL(siteUrl).host) {
    return { error: LOGIN_ERROR };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 200);
  const password = String(formData.get("password") ?? "");
  const token = formData.get("cf-turnstile-response");
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const safeEmail = email.length > 0 ? email : "unknown";
  const limit = await limitLogin(safeEmail);
  if (!limit.allowed) {
    return { error: "Too many attempts. Try again later." };
  }

  if (turnstileEnabled()) {
    const ok = await verifyTurnstile(
      typeof token === "string" && token !== "" ? token : null,
      ip,
    );
    if (!ok) {
      return { error: "Please complete the check and try again." };
    }
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    log.warn("login attempt failed");
    return { error: LOGIN_ERROR };
  }

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  } catch {
    // session was already gone
  }
  redirect("/admin/login");
}
