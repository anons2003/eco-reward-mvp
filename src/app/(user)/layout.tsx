import { UserAppShell } from "@/components/user/user-app-shell";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type ShellProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "full_name" | "points">;

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = user?.email ?? "Eco user";
  let points = 0;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("full_name,points").eq("id", user.id).single();
    const shellProfile = profile as ShellProfileRow | null;
    displayName = shellProfile?.full_name ?? user.email ?? displayName;
    points = shellProfile?.points ?? 0;
  }

  return (
    <UserAppShell displayName={displayName} points={points}>
      {children}
    </UserAppShell>
  );
}
