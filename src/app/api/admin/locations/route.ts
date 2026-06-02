import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { locationColumns, locationMutationError, locationPayloadSchema, toLocationValues, type AuditInsertTable, type LocationInsert, type LocationMutationError, type LocationRow } from "./location-schema";

type LocationSelectTable = {
  select(columns: string): {
    order(column: "name", options: { ascending: boolean }): Promise<{ data: LocationRow[] | null; error: { message: string } | null }>;
  };
};

type LocationInsertTable = {
  insert(values: LocationInsert): {
    select(columns: string): {
      single(): Promise<{ data: LocationRow | null; error: LocationMutationError | null }>;
    };
  };
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const supabase = createAdminClient();
  const locations = supabase.from("locations") as unknown as LocationSelectTable;
  const { data, error } = await locations.select(locationColumns).order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Unable to load locations" }, { status: 500 });
  }

  return NextResponse.json({ locations: data ?? [] });
}

export async function POST(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = locationPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid location payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const values = toLocationValues(parsed.data);
  const supabase = createAdminClient();
  const locations = supabase.from("locations") as unknown as LocationInsertTable;
  const { data, error } = await locations.insert(values).select(locationColumns).single();

  if (error || !data) {
    const message = locationMutationError(error, "Unable to create location");
    const status = message.startsWith("Địa điểm này đã tồn tại") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.location.create",
    target_id: data.id,
    metadata: { name: values.name, address: values.address, active: values.active },
  });

  return NextResponse.json({ location: data }, { status: 201 });
}
