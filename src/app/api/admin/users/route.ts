import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { Database } from "@/infrastructure/supabase/database.types";

const userColumns = "id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at";

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  fullName: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin"]).default("user"),
  phone: z.string().trim().max(32).optional(),
  location: z.string().trim().max(140).optional(),
  bio: z.string().trim().max(220).optional(),
});

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "avatar_url" | "phone" | "location" | "bio" | "role" | "status" | "points" | "trust_score" | "created_at">;
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];
type QueryResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;
type ProfileUpsertTable = {
  upsert(values: ProfileInsert, options: { onConflict: string }): {
    select(columns: string): {
      single(): QueryResult<ProfileRow>;
    };
  };
};
type AuditInsertTable = {
  insert(values: AuditLogInsert): Promise<{ error: { message: string } | null }>;
};

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function pagination(request: NextRequest | Request) {
  const url = new URL(request.url);
  const page = boundedInteger(url.searchParams.get("page"), 1, 1, Number.MAX_SAFE_INTEGER);
  const pageSize = boundedInteger(url.searchParams.get("pageSize"), 10, 1, 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export async function GET(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { page, pageSize, from, to } = pagination(request);
  const supabase = createAdminClient();
  const { data, count, error } = await supabase
    .from("profiles")
    .select(userColumns, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Unable to load users" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, pageSize });
}

export async function POST(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createAdminClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Unable to create auth user" }, { status: 400 });
  }

  const profile: ProfileInsert = {
    id: authData.user.id,
    email: input.email,
    full_name: input.fullName,
    role: input.role,
    status: "active",
    phone: nullable(input.phone),
    location: nullable(input.location),
    bio: nullable(input.bio),
  };

  const profiles = supabase.from("profiles") as unknown as ProfileUpsertTable;
  const { data, error } = await profiles.upsert(profile, { onConflict: "id" }).select(userColumns).single();
  if (error) {
    await supabase.auth.admin.deleteUser(authData.user.id).catch(() => undefined);
    return NextResponse.json({ error: "Auth user created but profile creation failed" }, { status: 500 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.user.create",
    target_id: authData.user.id,
    metadata: { email: input.email, role: input.role },
  });

  return NextResponse.json({ user: data }, { status: 201 });
}
