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

  const redirectTo = new URL("/auth/callback", appOrigin(request));
  redirectTo.searchParams.set("next", "/reset-password");

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo.toString(),
  });

  const url = new URL("/forgot-password", request.url);
  url.searchParams.set("sent", "1");
  return NextResponse.redirect(url, { status: 302 });
}
