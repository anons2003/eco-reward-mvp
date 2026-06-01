import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { Database } from "@/infrastructure/supabase/database.types";

const userColumns = "id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at";

const updateUserSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  role: z.enum(["user", "admin"]),
  phone: z.string().trim().max(32).optional(),
  location: z.string().trim().max(140).optional(),
  bio: z.string().trim().max(220).optional(),
  trustScore: z.number().int().min(0).max(100),
  status: z.enum(["active", "blocked", "deleted"]),
});

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "avatar_url" | "phone" | "location" | "bio" | "role" | "status" | "points" | "trust_score" | "created_at">;
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];
type QueryResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;
type ProfileSelectTable = {
  select(columns: string): {
    eq(column: "id", value: string): {
      single(): QueryResult<ProfileRow>;
    };
  };
};
type ProfileUpdateTable = {
  update(values: ProfileUpdate): {
    eq(column: "id", value: string): {
      select(columns: string): {
        single(): QueryResult<ProfileRow>;
      };
    };
  };
};
type ProfileDeleteTable = {
  update(values: Pick<ProfileUpdate, "status">): {
    eq(column: "id", value: string): {
      select(columns: "id"): {
        single(): QueryResult<Pick<ProfileRow, "id">>;
      };
    };
  };
};
type AuditInsertTable = {
  insert(values: AuditLogInsert): Promise<{ error: { message: string } | null }>;
};

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

async function getUserId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await getUserId(context);
  const supabase = createAdminClient();
  const profiles = supabase.from("profiles") as unknown as ProfileSelectTable;
  const { data, error } = await profiles.select(userColumns).eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: data });
}

export async function PATCH(request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await getUserId(context);
  if (id === admin.actorId) {
    return NextResponse.json({ error: "Admins cannot edit their own admin profile here" }, { status: 400 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid user payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const input = parsed.data;
  const update: ProfileUpdate = {
    full_name: input.fullName,
    role: input.role,
    phone: nullable(input.phone),
    location: nullable(input.location),
    bio: nullable(input.bio),
    trust_score: input.trustScore,
    status: input.status,
  };

  const supabase = createAdminClient();
  const profiles = supabase.from("profiles") as unknown as ProfileUpdateTable;
  const { data, error } = await profiles.update(update).eq("id", id).select(userColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.user.update",
    target_id: id,
    metadata: { status: input.status, role: input.role },
  });

  return NextResponse.json({ user: data });
}

export async function DELETE(_request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await getUserId(context);
  if (id === admin.actorId) {
    return NextResponse.json({ error: "Admins cannot delete themselves" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const profiles = supabase.from("profiles") as unknown as ProfileDeleteTable;
  const { data, error } = await profiles.update({ status: "deleted" }).eq("id", id).select("id").single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.user.delete",
    target_id: id,
    metadata: { mode: "soft_delete" },
  });

  return NextResponse.json({ ok: true });
}
