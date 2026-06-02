import { NextResponse } from "next/server";
import { getAuthUser } from "@/infrastructure/auth/session";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type AdminProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "role" | "status">;

export type AdminSession =
  | { ok: true; actorId: string; profile: AdminProfileRow }
  | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  const { data, error } = await supabase.from("profiles").select("id,role,status").eq("id", user.id).single();
  const profile = data as AdminProfileRow | null;

  if (error || !profile || profile.role !== "admin" || profile.status !== "active") {
    return { ok: false, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { ok: true, actorId: user.id, profile };
}
