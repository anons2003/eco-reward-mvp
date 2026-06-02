import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { binColumns, binLocationColumns, binPayloadSchema, toBinValues, type AuditInsertTable, type BinLocationRow, type BinMutationTable, type BinUpdate } from "../bin-schema";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type BinDeleteTable = {
  update(values: Pick<BinUpdate, "active">): {
    eq(column: "id", value: string): {
      select(columns: "id"): {
        single(): Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
};

type BinLocationTable = {
  select(columns: string): {
    eq(column: "id", value: string): {
      single(): Promise<{ data: BinLocationRow | null; error: { message: string } | null }>;
    };
  };
};

async function getBinId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = binPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bin payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const id = await getBinId(context);
  const supabase = createAdminClient();
  const locationTable = supabase.from("locations") as unknown as BinLocationTable;
  const { data: location, error: locationError } = await locationTable.select(binLocationColumns).eq("id", parsed.data.locationId).single();

  if (locationError || !location) {
    return NextResponse.json({ error: "Địa điểm đã chọn không tồn tại" }, { status: 400 });
  }

  const values = toBinValues(parsed.data, location, parsed.data.qrCode);
  const bins = supabase.from("bins") as unknown as BinMutationTable<BinUpdate>;
  const { data, error } = await bins.update(values).eq("id", id).select(binColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: "Bin not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.bin.update",
    target_id: id,
    metadata: { name: values.name, qrCode: values.qr_code, active: values.active },
  });

  return NextResponse.json({ bin: data });
}

export async function DELETE(_request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await getBinId(context);
  const supabase = createAdminClient();
  const bins = supabase.from("bins") as unknown as BinDeleteTable;
  const { data, error } = await bins.update({ active: false }).eq("id", id).select("id").single();

  if (error || !data) {
    return NextResponse.json({ error: "Bin not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.bin.delete",
    target_id: id,
    metadata: { mode: "deactivate" },
  });

  return NextResponse.json({ ok: true });
}
