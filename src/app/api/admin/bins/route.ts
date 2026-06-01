import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { binColumns, binPayloadSchema, toBinValues, type AuditInsertTable, type BinInsert, type BinRow } from "./bin-schema";

type BinSelectTable = {
  select(columns: string): {
    order(column: "name", options: { ascending: boolean }): Promise<{ data: BinRow[] | null; error: { message: string } | null }>;
  };
};

type BinInsertTable = {
  insert(values: BinInsert): {
    select(columns: string): {
      single(): Promise<{ data: BinRow | null; error: { message: string } | null }>;
    };
  };
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const supabase = createAdminClient();
  const bins = supabase.from("bins") as unknown as BinSelectTable;
  const { data, error } = await bins.select(binColumns).order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Unable to load bins" }, { status: 500 });
  }

  return NextResponse.json({ bins: data ?? [] });
}

export async function POST(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = binPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bin payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const values = toBinValues(parsed.data);
  const supabase = createAdminClient();
  const bins = supabase.from("bins") as unknown as BinInsertTable;
  const { data, error } = await bins.insert(values).select(binColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create bin" }, { status: 500 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.bin.create",
    target_id: data.id,
    metadata: { name: values.name, qrCode: values.qr_code, active: values.active },
  });

  return NextResponse.json({ bin: data }, { status: 201 });
}
