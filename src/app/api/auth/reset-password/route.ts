import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";

function redirectWithError(request: NextRequest | Request, error: string) {
  const url = new URL("/reset-password", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 302 });
}

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 8) {
    return redirectWithError(request, "weak_password");
  }

  if (password !== confirmPassword) {
    return redirectWithError(request, "password_mismatch");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirectWithError(request, "reset_failed");
  }

  await supabase.auth.signOut();

  const url = new URL("/login", request.url);
  url.searchParams.set("reset", "success");
  return NextResponse.redirect(url, { status: 302 });
}
