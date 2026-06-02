import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/infrastructure/config/env";
import { sanitizeSupabaseAuthCookies } from "./auth-cookies";
import type { Database } from "./database.types";

export async function createClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll(keyHints?: string[]) {
        return sanitizeSupabaseAuthCookies(cookieStore.getAll(), keyHints).cookies;
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Middleware handles refreshes.
        }
      },
    },
  });
}
