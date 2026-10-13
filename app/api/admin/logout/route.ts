import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { log } from "@/lib/log";
import { isSameOriginRequest } from "@/lib/request-security";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin && !isSameOriginRequest(headerList)) {
    redirect("/admin");
  }
  try {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  } catch (error) {
    log.error("logout failed", error);
  }
  redirect("/admin/login");
}
