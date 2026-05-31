import { NextResponse, type NextRequest } from "next/server";
import { appOrigin, safeNextPath } from "@/infrastructure/auth/redirects";
import { createClient } from "@/infrastructure/supabase/server";

export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const redirectTo = new URL("/auth/callback", appOrigin(request));
  redirectTo.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "oauth_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  return NextResponse.redirect(data.url, { status: 302 });
}
