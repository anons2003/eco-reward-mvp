import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { locationColumns, locationMutationError, locationPayloadSchema, toLocationValues, type AuditInsertTable, type LocationMutationError, type LocationRow, type LocationUpdate } from "../location-schema";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type LocationMutationTable<T> = {
  update(values: T): {
    eq(column: "id", value: string): {
      select(columns: string): {
        single(): Promise<{ data: LocationRow | null; error: LocationMutationError | null }>;
      };
    };
  };
};

async function getLocationId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = locationPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid location payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const id = await getLocationId(context);
  const values = toLocationValues(parsed.data);
  const supabase = createAdminClient();
  const locations = supabase.from("locations") as unknown as LocationMutationTable<LocationUpdate>;
  const { data, error } = await locations.update(values).eq("id", id).select(locationColumns).single();

  if (error || !data) {
    const message = locationMutationError(error, "Location not found");
    const status = message.startsWith("Địa điểm này đã tồn tại") ? 409 : 404;
    return NextResponse.json({ error: message }, { status });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.location.update",
    target_id: id,
    metadata: { name: values.name, address: values.address, active: values.active },
  });

  return NextResponse.json({ location: data });
}

export async function DELETE(_request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await getLocationId(context);
  const supabase = createAdminClient();
  const locations = supabase.from("locations") as unknown as LocationMutationTable<Pick<LocationUpdate, "active">>;
  const { data, error } = await locations.update({ active: false }).eq("id", id).select(locationColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.location.disable",
    target_id: id,
    metadata: { mode: "deactivate", name: data.name },
  });

  return NextResponse.json({ location: data });
}
