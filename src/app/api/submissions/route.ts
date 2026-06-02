import { NextResponse } from "next/server";
import { getAuthUser } from "@/infrastructure/auth/session";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type ScanSessionRow = Pick<Database["public"]["Tables"]["scan_sessions"]["Row"], "id" | "user_id" | "bin_id" | "expires_at">;
type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"];
type SubmissionResponse = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id">;

type ScanSessionTable = {
  select(columns: "id,user_id,bin_id,expires_at"): {
    eq(column: "id", value: string): {
      single(): Promise<{ data: ScanSessionRow | null; error: { message: string } | null }>;
    };
  };
};

type SubmissionTable = {
  select(columns: "id"): {
    eq(column: "scan_session_id", value: string): {
      limit(count: 1): {
        maybeSingle(): Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
  insert(values: SubmissionInsert): {
    select(columns: "id"): {
      single(): Promise<{ data: SubmissionResponse | null; error: { code?: string; message: string } | null }>;
    };
  };
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { scan_session_id?: unknown; scanSessionId?: unknown; image_url?: unknown; imageUrl?: unknown } | null;
  const scanSessionId = stringValue(body?.scan_session_id ?? body?.scanSessionId);
  const imageUrl = stringValue(body?.image_url ?? body?.imageUrl);

  if (!scanSessionId || !imageUrl) {
    return NextResponse.json({ error: "scan_session_id và image_url là bắt buộc." }, { status: 400 });
  }

  const scanSessions = supabase.from("scan_sessions") as unknown as ScanSessionTable;
  const { data: session } = await scanSessions.select("id,user_id,bin_id,expires_at").eq("id", scanSessionId).single();

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: "Phiên QR không hợp lệ." }, { status: 400 });
  }

  if (Date.parse(session.expires_at) <= Date.now()) {
    return NextResponse.json({ error: "Phiên QR đã hết hạn." }, { status: 400 });
  }

  const submissions = supabase.from("submissions") as unknown as SubmissionTable;
  const existingSubmission = await submissions.select("id").eq("scan_session_id", session.id).limit(1).maybeSingle();

  if (existingSubmission.data) {
    return NextResponse.json({ error: "Phiên QR này đã được sử dụng." }, { status: 400 });
  }

  const { data: submission, error } = await submissions
    .insert({
      user_id: user.id,
      bin_id: session.bin_id,
      scan_session_id: session.id,
      image_url: imageUrl,
      ai_result: { mode: "manual_review" },
      status: "pending_review",
      points: 10,
      reason: "Chờ admin duyệt thủ công.",
      risk_flags: [],
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    return NextResponse.json({ error: "Phiên QR này đã được sử dụng." }, { status: 400 });
  }

  if (error || !submission) {
    return NextResponse.json({ error: "Không tạo được lượt gửi." }, { status: 500 });
  }

  return NextResponse.json({ submission });
}
