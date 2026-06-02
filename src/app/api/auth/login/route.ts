import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { safeNextPath } from "@/infrastructure/auth/redirects";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type AuthProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(typeof formData.get("next") === "string" ? String(formData.get("next")) : null);
  const loginPath = next.startsWith("/admin") ? "/admin/login" : "/login";

  if (!email || !password) {
    const url = new URL(loginPath, request.url);
    url.searchParams.set("error", "missing_credentials");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const url = new URL(loginPath, request.url);
    url.searchParams.set("error", "invalid_credentials");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  let user: User | null = signInData?.user ?? null;
  if (!user) {
    const { data: currentUserData } = await supabase.auth.getUser();
    user = currentUserData.user ?? null;
  }

  if (!user?.email_confirmed_at) {
    await supabase.auth.signOut();
    const url = new URL("/verify-email", request.url);
    if (email) {
      url.searchParams.set("email", email.trim().toLowerCase());
    }
    url.searchParams.set("next", next);
    url.searchParams.set("error", "email_not_confirmed");
    return NextResponse.redirect(url, { status: 302 });
  }

  let profile: AuthProfileRow | null = null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  profile = data;
  const authProfile = profile as AuthProfileRow | null;
  const destination = authProfile?.role === "admin" ? (next.startsWith("/admin") ? next : "/admin/dashboard") : next.startsWith("/admin") ? "/dashboard" : next;

  return NextResponse.redirect(new URL(destination, request.url), { status: 302 });
}
