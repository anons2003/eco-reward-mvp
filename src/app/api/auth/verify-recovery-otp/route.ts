import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";

function verifyRecoveryUrl(request: NextRequest | Request, email: string, error: string) {
  const url = new URL("/verify-recovery", request.url);
  if (email) {
    url.searchParams.set("email", email);
  }
  url.searchParams.set("error", error);
  return url;
}

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "").trim();

  if (!email || !token) {
    return NextResponse.redirect(verifyRecoveryUrl(request, email, "missing_fields"), { status: 302 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });

  if (error) {
    return NextResponse.redirect(verifyRecoveryUrl(request, email, "invalid_code"), { status: 302 });
  }

  const url = new URL("/reset-password", request.url);
  url.searchParams.set("verified", "1");
  return NextResponse.redirect(url, { status: 302 });
}
