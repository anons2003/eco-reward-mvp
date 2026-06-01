import { cache } from "react";
import { redirect } from "next/navigation";
import { avatarUrlFromMetadata } from "@/infrastructure/auth/avatar";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

export type UserShellProfile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "points" | "avatar_url" | "trust_score" | "phone" | "location" | "bio">;

export const getSupabaseServerClient = cache(async () => createClient());

export const getCurrentUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getUserShellProfile = cache(async (userId: string) => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("full_name,points,avatar_url,trust_score,phone,location,bio").eq("id", userId).single();
  return data as UserShellProfile | null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getUserShell() {
  const user = await requireUser();
  const profile = await getUserShellProfile(user.id);
  const fallbackAvatar = avatarUrlFromMetadata(user.user_metadata);

  return {
    user,
    profile,
    displayName: profile?.full_name ?? user.email ?? "SeaTech user",
    avatarUrl: profile?.avatar_url ?? fallbackAvatar,
    points: profile?.points ?? 0,
  };
}
