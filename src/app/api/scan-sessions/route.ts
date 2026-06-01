import { NextResponse } from "next/server";
import { env } from "@/infrastructure/config/env";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "qr_code" | "location_name" | "active">;
type ScanSessionInsert = Database["public"]["Tables"]["scan_sessions"]["Insert"];
type ScanSessionResponse = Pick<Database["public"]["Tables"]["scan_sessions"]["Row"], "id" | "expires_at">;

type BinLookupTable = {
  select(columns: string): {
    eq(column: "qr_code", value: string): {
      single(): Promise<{ data: BinRow | null; error: { message: string } | null }>;
    };
  };
};

type ScanSessionTable = {
  insert(values: ScanSessionInsert): {
    select(columns: "id,expires_at"): {
      single(): Promise<{ data: ScanSessionResponse | null; error: { message: string } | null }>;
    };
  };
};

function normalizeQrCode(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, "-").toUpperCase() : "";
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { qr_code?: unknown; qrCode?: unknown; lat?: unknown; lng?: unknown } | null;
  const qrCode = normalizeQrCode(body?.qr_code ?? body?.qrCode);
  if (!qrCode) {
    return NextResponse.json({ error: "qr_code là bắt buộc." }, { status: 400 });
  }

  const bins = supabase.from("bins") as unknown as BinLookupTable;
  const { data: bin } = await bins.select("id,name,qr_code,location_name,active").eq("qr_code", qrCode).single();

  if (!bin) {
    return NextResponse.json({ error: "QR không tồn tại trong hệ thống." }, { status: 400 });
  }

  if (!bin.active) {
    return NextResponse.json({ error: "Thùng rác đang bảo trì." }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + env.qrSessionTtlSeconds * 1000).toISOString();
  const scanSessions = supabase.from("scan_sessions") as unknown as ScanSessionTable;
  const { data: session, error } = await scanSessions
    .insert({
      user_id: user.id,
      bin_id: bin.id,
      qr_code: bin.qr_code,
      lat: optionalNumber(body?.lat),
      lng: optionalNumber(body?.lng),
      expires_at: expiresAt,
    })
    .select("id,expires_at")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Không tạo được phiên quét." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    session: { id: session.id, expiresAt: session.expires_at },
    bin: { id: bin.id, name: bin.name, locationName: bin.location_name, qrCode: bin.qr_code },
  });
}
