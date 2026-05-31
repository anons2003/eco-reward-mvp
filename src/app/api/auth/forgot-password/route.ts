import { NextResponse, type NextRequest } from "next/server";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error("Password reset email failed", error.message);
    const url = new URL("/forgot-password", request.url);
    url.searchParams.set("error", "reset_failed");
    return NextResponse.redirect(url, { status: 302 });
  }

  const url = new URL("/forgot-password", request.url);
  url.searchParams.set("sent", "1");
  return NextResponse.redirect(url, { status: 302 });
}
