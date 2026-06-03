import { NextResponse } from "next/server";
import { analyzeImage } from "@/application/ai/analyze-image";
import type { AIResult } from "@/core/entities/types";
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

function uniqueFlags(flags: string[]) {
  return Array.from(new Set(flags.filter(Boolean)));
}

function riskFlagsFromAI(aiResult: AIResult) {
  const threshold = Number(process.env.MIN_AI_CONFIDENCE ?? "0.75");
  const riskFlags = [...(aiResult.fraudFlags ?? [])];

  if (aiResult.confidence < threshold) riskFlags.push("low_confidence");
  if (aiResult.wasteType === "unknown") riskFlags.push("unknown_waste");
  if (aiResult.imageQuality !== "good") riskFlags.push("image_quality");
  if (aiResult.isValidSubmission === false) riskFlags.push("invalid_submission");
  if (aiResult.contaminationRisk === "high") riskFlags.push("high_contamination");

  return uniqueFlags(riskFlags);
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

  const aiResult = await analyzeImage(imageUrl);
  const riskFlags = riskFlagsFromAI(aiResult);

  const { data: submission, error } = await submissions
    .insert({
      user_id: user.id,
      bin_id: session.bin_id,
      scan_session_id: session.id,
      image_url: imageUrl,
      ai_result: aiResult,
      status: "pending_review",
      points: 0,
      reason: riskFlags.length ? "AI đã phát hiện rủi ro, chờ admin kiểm tra." : "AI đã phân tích, chờ admin duyệt.",
      risk_flags: riskFlags,
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
