import { NextResponse, type NextRequest } from "next/server";
import { appOrigin, safeNextPath } from "@/infrastructure/auth/redirects";
import { createClient } from "@/infrastructure/supabase/server";

function verificationUrl(request: NextRequest | Request, email: string, next: string, statusKey: "sent" | "error", statusValue: string) {
  const url = new URL("/verify-email", request.url);
  if (email) {
    url.searchParams.set("email", email);
  }
  url.searchParams.set("next", next);
  url.searchParams.set(statusKey, statusValue);
  return url;
}

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = safeNextPath(typeof formData.get("next") === "string" ? String(formData.get("next")) : null);

  if (!email) {
    return NextResponse.redirect(verificationUrl(request, "", next, "error", "missing_email"), { status: 302 });
  }

  const redirectTo = new URL("/auth/callback", appOrigin(request));
  redirectTo.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: redirectTo.toString(),
    },
  });

  if (error) {
    return NextResponse.redirect(verificationUrl(request, email, next, "error", "resend_failed"), { status: 302 });
  }

  return NextResponse.redirect(verificationUrl(request, email, next, "sent", "1"), { status: 302 });
}
