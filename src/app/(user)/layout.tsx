import { redirect } from "next/navigation";
import { UserAppShell } from "@/components/user/user-app-shell";
import { avatarUrlFromMetadata } from "@/infrastructure/auth/avatar";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type ShellProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "points" | "avatar_url">;

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let displayName = user.email ?? "Eco user";
  let avatarUrl = avatarUrlFromMetadata(user.user_metadata);
  let points = 0;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("full_name,points,avatar_url").eq("id", user.id).single();
    const shellProfile = profile as ShellProfileRow | null;
    displayName = shellProfile?.full_name ?? user.email ?? displayName;
    avatarUrl = shellProfile?.avatar_url ?? avatarUrl;
    points = shellProfile?.points ?? 0;
  }

  return (
    <UserAppShell avatarUrl={avatarUrl} displayName={displayName} points={points}>
      {children}
    </UserAppShell>
  );
}
