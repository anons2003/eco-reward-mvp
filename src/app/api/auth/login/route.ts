import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type AuthProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

function safeNextPath(value: FormDataEntryValue | null, fallback: string) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), "/dashboard");

  if (!email || !password) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "missing_credentials");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "invalid_credentials");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 302 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let profile: AuthProfileRow | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    profile = data;
  }
  const authProfile = profile as AuthProfileRow | null;
  const destination = authProfile?.role === "admin" ? (next.startsWith("/admin") ? next : "/admin/dashboard") : next.startsWith("/admin") ? "/dashboard" : next;

  return NextResponse.redirect(new URL(destination, request.url), { status: 302 });
}
