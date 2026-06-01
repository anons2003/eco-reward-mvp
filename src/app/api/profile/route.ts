import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type ProfileDetailsUpdate = Pick<Database["public"]["Tables"]["profiles"]["Update"], "full_name" | "phone" | "location" | "bio">;
type ProfileUpdateTable = {
  update(values: ProfileDetailsUpdate): {
    eq(column: "id", value: string): Promise<{ error: { message: string } | null }>;
  };
};

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function nullableText(value: FormDataEntryValue | null, maxLength: number) {
  const cleaned = cleanText(value, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

function settingsUrl(request: NextRequest | Request, profile: string) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("profile", profile);
  return url;
}

export async function POST(request: NextRequest | Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 302 });
  }

  const formData = await request.formData();
  const fullName = cleanText(formData.get("fullName"), 120);

  if (!fullName) {
    return NextResponse.redirect(settingsUrl(request, "missing_name"), { status: 302 });
  }

  const profiles = supabase.from("profiles") as unknown as ProfileUpdateTable;
  const { error } = await profiles
    .update({
      full_name: fullName,
      phone: nullableText(formData.get("phone"), 32),
      location: nullableText(formData.get("location"), 140),
      bio: nullableText(formData.get("bio"), 220),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update failed", { error: error.message });
    return NextResponse.redirect(settingsUrl(request, "update_failed"), { status: 302 });
  }

  return NextResponse.redirect(settingsUrl(request, "success"), { status: 302 });
}
