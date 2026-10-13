"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { turnstileEnabled } from "@/lib/env";
import { log } from "@/lib/log";
import { limitLogin } from "@/lib/ratelimit";
import { isSameOriginRequest } from "@/lib/request-security";
import { supabaseServer } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";

const LOGIN_ERROR = "Incorrect email or password.";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && !isSameOriginRequest(headerList)) {
    return { error: "This request could not be verified. Refresh and try again." };
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
    log.warn("login failed", { code: error.code });
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email address before signing in." };
    }
    return { error: LOGIN_ERROR };
  }

  const { data: isAdmin, error: adminCheckError } =
    await supabase.rpc("is_admin");
  if (adminCheckError) {
    log.error("admin membership check failed", {
      code: adminCheckError.code,
    });
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      log.warn("session cleanup failed", { code: signOutError.code });
    }
    return { error: "Unable to verify admin access. Please try again." };
  }

  if (!isAdmin) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      log.warn("session cleanup failed", { code: signOutError.code });
    }
    return { error: "This account does not have admin access." };
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
