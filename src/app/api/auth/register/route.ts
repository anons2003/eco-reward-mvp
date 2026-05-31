import { NextResponse, type NextRequest } from "next/server";
import { appOrigin, safeNextPath } from "@/infrastructure/auth/redirects";
import { createClient } from "@/infrastructure/supabase/server";

function redirectWithError(request: NextRequest | Request, error: string, next: string) {
  const url = new URL("/register", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url, { status: 302 });
}

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(typeof formData.get("next") === "string" ? String(formData.get("next")) : null);

  if (!name || !email || !password) {
    return redirectWithError(request, "missing_fields", next);
  }

  if (password.length < 8) {
    return redirectWithError(request, "weak_password", next);
  }

  const redirectTo = new URL("/auth/callback", appOrigin(request));
  redirectTo.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: redirectTo.toString(),
    },
  });

  if (error) {
    return redirectWithError(request, "register_failed", next);
  }

  if (data.session) {
    await supabase.auth.signOut();
  }

  const url = new URL("/verify-email", request.url);
  url.searchParams.set("email", email);
  url.searchParams.set("next", next);
  url.searchParams.set("sent", "1");
  return NextResponse.redirect(url, { status: 302 });
}
