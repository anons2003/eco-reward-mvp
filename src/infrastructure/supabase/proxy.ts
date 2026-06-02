import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/infrastructure/config/env";
import { appOrigin } from "@/infrastructure/auth/redirects";
import { sanitizeSupabaseAuthCookies } from "./auth-cookies";
import type { Database } from "./database.types";

type AuthProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

const protectedUserPaths = ["/dashboard", "/scan", "/capture", "/result", "/wallet", "/rewards", "/history", "/profile", "/settings"];
const protectedAdminPaths = ["/admin"];

function isProtectedPath(path: string) {
  if (path === "/admin/login") return false;
  return protectedUserPaths.some((prefix) => path.startsWith(prefix)) || protectedAdminPaths.some((prefix) => path.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = request.nextUrl.pathname.startsWith("/admin") ? "/admin/login" : "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function withStaleAuthCookieDeletes(response: NextResponse, staleAuthCookieNames: Set<string>) {
  staleAuthCookieNames.forEach((name) => {
    response.cookies.delete(name);
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (path === "/" && request.nextUrl.searchParams.has("code")) {
    const url = new URL("/auth/callback", appOrigin(request));
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
    if (!url.searchParams.has("type") && !url.searchParams.has("next")) {
      url.searchParams.set("type", "recovery");
    }
    return NextResponse.redirect(url);
  }

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return isProtectedPath(request.nextUrl.pathname) ? redirectToLogin(request) : response;
  }

  const staleAuthCookieNames = new Set<string>();
  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll(keyHints?: string[]) {
        const { cookies, staleCookieNames } = sanitizeSupabaseAuthCookies(request.cookies.getAll(), keyHints);
        staleCookieNames.forEach((name) => {
          staleAuthCookieNames.add(name);
          request.cookies.delete(name);
        });
        return cookies;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  async function getProfileRole() {
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return (data as AuthProfileRow | null)?.role ?? null;
  }

  if ((path === "/login" || path === "/admin/login") && user) {
    const role = await getProfileRole();
    return withStaleAuthCookieDeletes(NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", request.url)), staleAuthCookieNames);
  }

  if (path === "/admin/login") {
    return withStaleAuthCookieDeletes(response, staleAuthCookieNames);
  }

  if (isProtectedPath(path) && !user) {
    return withStaleAuthCookieDeletes(redirectToLogin(request), staleAuthCookieNames);
  }

  if (protectedUserPaths.some((prefix) => path.startsWith(prefix)) && user) {
    const role = await getProfileRole();
    if (role === "admin") {
      return withStaleAuthCookieDeletes(NextResponse.redirect(new URL("/admin/dashboard", request.url)), staleAuthCookieNames);
    }
  }

  if (protectedAdminPaths.some((prefix) => path.startsWith(prefix)) && user) {
    const role = await getProfileRole();
    if (role !== "admin") {
      return withStaleAuthCookieDeletes(NextResponse.redirect(new URL("/dashboard", request.url)), staleAuthCookieNames);
    }
  }

  return withStaleAuthCookieDeletes(response, staleAuthCookieNames);
}
