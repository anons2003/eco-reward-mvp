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
  select(columns: string): Promise<{ data: BinLocationRow[] | null; error: { message: string } | null }>;
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

function normalizeLocationText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function distanceMeters(first: Pick<LocationInsert, "lat" | "lng">, second: Pick<LocationInsert, "lat" | "lng">) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const radius = 6_371_000;
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findReusableLocation(locations: BinLocationRow[], values: LocationInsert) {
  const normalizedAddress = normalizeLocationText(values.address);
  const normalizedName = normalizeLocationText(values.name);

  return (
    locations.find((location) => normalizeLocationText(location.address) === normalizedAddress) ??
    locations.find((location) => distanceMeters(values, location) <= 25 && normalizeLocationText(location.name) === normalizedName) ??
    null
  );
}

async function findOrCreateLocation(locationTable: BinLocationTable, values: LocationInsert) {
  const existing = await locationTable.select(binLocationColumns);
  if (existing.error) return { data: null, error: existing.error };

  const reusable = findReusableLocation(existing.data ?? [], values);
  if (reusable) return { data: reusable, error: null };

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
  const { data: location, error: locationError } = await findOrCreateLocation(locationTable, toLocationValues(parsed.data.location));

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
