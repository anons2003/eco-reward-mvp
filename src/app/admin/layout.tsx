import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type AdminProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role" | "full_name" | "avatar_url">;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await supabase.from("profiles").select("role,full_name,avatar_url").eq("id", user.id).single();
  const profile = data as AdminProfileRow | null;

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AdminShell avatarUrl={profile.avatar_url} displayName={profile.full_name || user.email || "Admin"}>
      {children}
    </AdminShell>
  );
}
