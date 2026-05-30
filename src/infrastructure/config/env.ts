export const env = {
  appName: process.env.APP_NAME ?? "Eco-Reward",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  qrSessionTtlSeconds: Number(process.env.QR_SESSION_TTL_SECONDS ?? "120"),
  maxSubmissionsPerUserPerDay: Number(process.env.MAX_SUBMISSIONS_PER_USER_PER_DAY ?? "10"),
  gpsRadiusMeters: Number(process.env.GPS_RADIUS_METERS ?? "50"),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function hasSupabaseConfig(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
