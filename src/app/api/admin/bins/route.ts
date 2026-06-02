import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { toLocationValues, type LocationInsert } from "../locations/location-schema";
import { binColumns, binCreatePayloadSchema, binLocationColumns, toBinValues, type AuditInsertTable, type BinInsert, type BinLocationRow, type BinRow } from "./bin-schema";

type BinSelectTable = {
  select(columns: string): {
    order(column: "name", options: { ascending: boolean }): Promise<{ data: BinRow[] | null; error: { message: string } | null }>;
  };
};

type BinInsertTable = {
  insert(values: BinInsert): {
    select(columns: string): {
      single(): Promise<{ data: BinRow | null; error: { code?: string; message: string } | null }>;
    };
  };
};

type BinLocationTable = {
  select(columns: string): {
    eq(column: "address", value: string): {
      limit(count: 1): {
        maybeSingle(): Promise<{ data: BinLocationRow | null; error: { message: string } | null }>;
      };
    };
  };
  update(values: LocationInsert): {
    eq(column: "id", value: string): {
      select(columns: string): {
        single(): Promise<{ data: BinLocationRow | null; error: { message: string } | null }>;
      };
    };
  };
  insert(values: LocationInsert): {
    select(columns: string): {
      single(): Promise<{ data: BinLocationRow | null; error: { message: string } | null }>;
    };
  };
};

function generateQrCode() {
  return `SEATECH-BIN-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function isQrDuplicate(error: { code?: string; message: string } | null) {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return error.code === "23505" && (message.includes("qr_code") || message.includes("bins_qr_code_key"));
}

async function findOrCreateLocationByAddress(locationTable: BinLocationTable, values: LocationInsert) {
  const existing = await locationTable.select(binLocationColumns).eq("address", values.address).limit(1).maybeSingle();
  if (existing.error) return existing;

  if (existing.data) {
    return locationTable.update(values).eq("id", existing.data.id).select(binLocationColumns).single();
  }

  return locationTable.insert(values).select(binLocationColumns).single();
}

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
  const parsed = binCreatePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bin payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const supabase = createAdminClient();
  const locationTable = supabase.from("locations") as unknown as BinLocationTable;
  const { data: location, error: locationError } = await findOrCreateLocationByAddress(locationTable, toLocationValues(parsed.data.location));

  if (locationError || !location) {
    return NextResponse.json({ error: locationError?.message ?? "Không thể tạo địa điểm cho thùng rác" }, { status: 500 });
  }

  const bins = supabase.from("bins") as unknown as BinInsertTable;
  let values = toBinValues(parsed.data, location, generateQrCode());
  let mutation = await bins.insert(values).select(binColumns).single();

  for (let attempt = 0; isQrDuplicate(mutation.error) && attempt < 4; attempt += 1) {
    values = toBinValues(parsed.data, location, generateQrCode());
    mutation = await bins.insert(values).select(binColumns).single();
  }

  if (mutation.error || !mutation.data) {
    return NextResponse.json({ error: mutation.error?.message ?? "Unable to create bin" }, { status: 500 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.bin.create",
    target_id: mutation.data.id,
    metadata: { name: values.name, qrCode: values.qr_code, active: values.active },
  });

  return NextResponse.json({ bin: mutation.data }, { status: 201 });
}
