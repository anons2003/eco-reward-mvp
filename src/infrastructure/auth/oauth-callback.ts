import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/infrastructure/supabase/database.types";
import { createClient } from "@/infrastructure/supabase/server";
import { appOrigin, safeNextPath } from "./redirects";

type AuthProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

function isRecoveryCallback(request: NextRequest) {
  if (request.nextUrl.searchParams.get("type") === "recovery") {
    return true;
  }

  return request.cookies.getAll().some((cookie) => {
    if (!cookie.name.endsWith("auth-token-code-verifier") || !cookie.value.startsWith("base64-")) {
      return false;
    }

    try {
      return Buffer.from(cookie.value.replace(/^base64-/, ""), "base64").toString("utf8").includes("/recovery");
    } catch {
      return false;
    }
  });
}

export async function handleOAuthCallback(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const fallbackPath = isRecoveryCallback(request) ? "/reset-password" : "/dashboard";
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), fallbackPath);
  const origin = appOrigin(request);

  if (!code) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "oauth_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "oauth_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: AuthProfileRow | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = data;
  }

  const authProfile = profile as AuthProfileRow | null;
  const destination =
    authProfile?.role === "admin"
      ? next.startsWith("/admin")
        ? next
        : "/admin/dashboard"
      : next.startsWith("/admin")
        ? "/dashboard"
        : next;

  return NextResponse.redirect(new URL(destination, origin), { status: 302 });
}
