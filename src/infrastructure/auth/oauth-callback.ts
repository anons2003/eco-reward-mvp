import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/infrastructure/auth/session";
import type { Database } from "@/infrastructure/supabase/database.types";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { createClient } from "@/infrastructure/supabase/server";
import { appOrigin, safeNextPath } from "./redirects";

type AuthProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;
type AuthUser = NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]>;
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type AdminProfilesTable = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    };
  };
  insert: (row: ProfileInsert) => Promise<{ error: { message: string } | null }>;
};

function isRecoveryCallback(request: NextRequest) {
  if (request.nextUrl.searchParams.get("type") === "recovery") {
    return true;
  }

  return request.cookies.getAll().some((cookie) => {
    if (!cookie.name.endsWith("auth-token-code-verifier") || !cookie.value.startsWith("base64-")) {
      return false;
    }

    try {
      return Buffer.from(cookie.value.replace(/^base64-/, ""), "base64").toString("utf8").includes("/recovery");
    } catch {
      return false;
    }
  });
}

async function ensureOAuthProfile(user: AuthUser) {
  try {
    const admin = createAdminClient();
    const profiles = admin.from("profiles") as unknown as AdminProfilesTable;
    const { data: existing } = await profiles.select("id").eq("id", user.id).single();

    if (existing) {
      return;
    }

    const metadata = user.user_metadata ?? {};
    const email = user.email ?? "";
    const fullName = typeof metadata.full_name === "string" ? metadata.full_name : typeof metadata.name === "string" ? metadata.name : email.split("@")[0] || "SeaTech user";
    const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : typeof metadata.picture === "string" ? metadata.picture : null;

    const { error } = await profiles.insert({
      id: user.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: "user",
      status: "active",
    });

    if (error) {
      console.error("OAuth profile sync failed", { error: error.message, userId: user.id });
    }
  } catch (error) {
    console.error("OAuth profile sync failed", { error: error instanceof Error ? error.message : "Unknown error", userId: user.id });
  }
}

export async function handleOAuthCallback(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const fallbackPath = isRecoveryCallback(request) ? "/reset-password" : "/dashboard";
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), fallbackPath);
  const origin = appOrigin(request);

  if (!code) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "oauth_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "oauth_failed");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const user = await getAuthUser(supabase);

  let profile: AuthProfileRow | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = data;

    if (!profile) {
      await ensureOAuthProfile(user);
      profile = { role: "user" };
    }
  }

  const authProfile = profile as AuthProfileRow | null;
  const destination =
    authProfile?.role === "admin"
      ? next.startsWith("/admin")
        ? next
        : "/admin/dashboard"
      : next.startsWith("/admin")
        ? "/dashboard"
        : next;

  return NextResponse.redirect(new URL(destination, origin), { status: 302 });
}
