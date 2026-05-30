import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/infrastructure/config/env";
import type { Database } from "./database.types";

export function createClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables");
  }

  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
