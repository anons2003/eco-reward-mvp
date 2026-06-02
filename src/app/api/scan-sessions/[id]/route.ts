import { NextResponse } from "next/server";
import { getAuthUser } from "@/infrastructure/auth/session";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type ScanSessionRow = Pick<Database["public"]["Tables"]["scan_sessions"]["Row"], "id" | "user_id" | "bin_id" | "qr_code" | "expires_at" | "created_at">;
type BinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "qr_code" | "location_name" | "active">;

type ScanSessionTable = {
  select(columns: "id,user_id,bin_id,qr_code,expires_at,created_at"): {
    eq(column: "id", value: string): {
      single(): Promise<{ data: ScanSessionRow | null; error: { message: string } | null }>;
    };
  };
};

type BinTable = {
  select(columns: "id,name,qr_code,location_name,active"): {
    eq(column: "id", value: string): {
      single(): Promise<{ data: BinRow | null; error: { message: string } | null }>;
    };
  };
};

type SubmissionLookupTable = {
  select(columns: "id"): {
    eq(column: "scan_session_id", value: string): {
      limit(count: 1): {
        maybeSingle(): Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
};

async function getSessionId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const sessionId = await getSessionId(context);
  const scanSessions = supabase.from("scan_sessions") as unknown as ScanSessionTable;
  const { data: session } = await scanSessions.select("id,user_id,bin_id,qr_code,expires_at,created_at").eq("id", sessionId).single();

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Phiên QR không hợp lệ." }, { status: 404 });
  }

  const submissions = supabase.from("submissions") as unknown as SubmissionLookupTable;
  const used = await submissions.select("id").eq("scan_session_id", session.id).limit(1).maybeSingle();

  const bins = supabase.from("bins") as unknown as BinTable;
  const { data: bin } = await bins.select("id,name,qr_code,location_name,active").eq("id", session.bin_id).single();

  return NextResponse.json({
    session: {
      id: session.id,
      expiresAt: session.expires_at,
      expired: Date.parse(session.expires_at) <= Date.now(),
      used: Boolean(used.data),
      createdAt: session.created_at,
    },
    bin: bin
      ? {
          id: bin.id,
          name: bin.name,
          locationName: bin.location_name,
          qrCode: bin.qr_code,
          active: bin.active,
        }
      : null,
  });
}
