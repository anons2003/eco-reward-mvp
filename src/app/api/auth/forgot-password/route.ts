import { NextResponse, type NextRequest } from "next/server";
import { appOrigin } from "@/infrastructure/auth/redirects";
import { createClient } from "@/infrastructure/supabase/server";

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    const url = new URL("/forgot-password", request.url);
    url.searchParams.set("error", "missing_email");
    return NextResponse.redirect(url, { status: 302 });
  }

  const redirectTo = new URL("/", appOrigin(request));
  redirectTo.searchParams.set("type", "recovery");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo.toString(),
  });

  if (error) {
    console.error("Password reset email failed", error.message);
    const url = new URL("/forgot-password", request.url);
    url.searchParams.set("error", error.message.toLowerCase().includes("rate limit") ? "email_rate_limited" : "reset_failed");
    return NextResponse.redirect(url, { status: 302 });
  }

  const url = new URL("/forgot-password", request.url);
  url.searchParams.set("sent", "1");
  return NextResponse.redirect(url, { status: 302 });
}
