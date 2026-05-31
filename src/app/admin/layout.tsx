import { redirect } from "next/navigation";
import { TopBar } from "@/components/shared/top-bar";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type AdminProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const profile = data as AdminProfileRow | null;

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="eco-shell min-h-screen">
      <TopBar admin />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
