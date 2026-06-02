import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/infrastructure/auth/session";
import { createClient } from "@/infrastructure/supabase/server";

function redirectWithPasswordStatus(request: NextRequest | Request, status: string) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("password", status);
  return NextResponse.redirect(url, { status: 302 });
}

export async function POST(request: NextRequest | Request) {
  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !password || !confirmPassword) {
    return redirectWithPasswordStatus(request, "missing_fields");
  }

  if (password.length < 8) {
    return redirectWithPasswordStatus(request, "weak_password");
  }

  if (password !== confirmPassword) {
    return redirectWithPasswordStatus(request, "password_mismatch");
  }

  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user?.email) {
    return redirectWithPasswordStatus(request, "unauthorized");
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return redirectWithPasswordStatus(request, "current_invalid");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirectWithPasswordStatus(request, "update_failed");
  }

  return redirectWithPasswordStatus(request, "success");
}
