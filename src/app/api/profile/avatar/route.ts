import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/infrastructure/auth/session";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";
import { avatarPublicUrl, putAvatarObject } from "@/infrastructure/storage/s3";

const maxAvatarSize = 2 * 1024 * 1024;
type ProfileAvatarUpdate = Pick<Database["public"]["Tables"]["profiles"]["Update"], "avatar_url" | "avatar_object_key">;
type ProfileUpdateTable = {
  update(values: ProfileAvatarUpdate): {
    eq(column: "id", value: string): Promise<{ error: { message: string } | null }>;
  };
};

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function settingsUrl(request: NextRequest | Request, avatar: string) {
  const url = new URL("/settings", request.url);
  url.searchParams.set("avatar", avatar);
  return url;
}

export async function POST(request: NextRequest | Request) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 302 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(settingsUrl(request, "missing_file"), { status: 302 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.redirect(settingsUrl(request, "invalid_type"), { status: 302 });
  }

  if (file.size > maxAvatarSize) {
    return NextResponse.redirect(settingsUrl(request, "file_too_large"), { status: 302 });
  }

  const key = `avatars/${user.id}/${crypto.randomUUID()}.${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  let avatarUrl: string;
  try {
    await putAvatarObject({ key, body, contentType: file.type });
    avatarUrl = avatarPublicUrl(key);
  } catch (error) {
    console.error("Avatar S3 upload failed", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.redirect(settingsUrl(request, "storage_failed"), { status: 302 });
  }

  const profiles = supabase.from("profiles") as unknown as ProfileUpdateTable;
  const { error } = await profiles
    .update({
      avatar_url: avatarUrl,
      avatar_object_key: key,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Avatar profile update failed", { error: error.message });
    return NextResponse.redirect(settingsUrl(request, "profile_update_failed"), { status: 302 });
  }

  return NextResponse.redirect(settingsUrl(request, "success"), { status: 302 });
}
