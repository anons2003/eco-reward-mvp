import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/infrastructure/config/env";
import type { Database } from "./database.types";

type AuthProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

const protectedUserPaths = ["/dashboard", "/scan", "/capture", "/result", "/wallet", "/rewards"];
const protectedAdminPaths = ["/admin"];

function isProtectedPath(path: string) {
  return protectedUserPaths.some((prefix) => path.startsWith(prefix)) || protectedAdminPaths.some((prefix) => path.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return isProtectedPath(request.nextUrl.pathname) ? redirectToLogin(request) : response;
  }

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const path = request.nextUrl.pathname;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function getProfileRole() {
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return (data as AuthProfileRow | null)?.role ?? null;
  }

  if (path === "/login" && user) {
    const role = await getProfileRole();
    return NextResponse.redirect(new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", request.url));
  }

  if (isProtectedPath(path) && !user) {
    return redirectToLogin(request);
  }

  if (protectedAdminPaths.some((prefix) => path.startsWith(prefix)) && user) {
    const role = await getProfileRole();
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
