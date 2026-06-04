import { NextResponse } from "next/server";
import { analyzeImage } from "@/application/ai/analyze-image";
import type { AIResult, SubmissionStatus, WasteType } from "@/core/entities/types";
import { calculatePoints } from "@/core/points/calculate-points";
import { isMvpAutoWasteType, mvpWasteTypeLabel } from "@/core/points/point-rules";
import { getAuthUser } from "@/infrastructure/auth/session";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database, Json } from "@/infrastructure/supabase/database.types";

type ScanSessionRow = Pick<Database["public"]["Tables"]["scan_sessions"]["Row"], "id" | "user_id" | "bin_id" | "expires_at">;
type CreateSubmissionWithPointsArgs = Database["public"]["Functions"]["create_submission_with_points"]["Args"];
type CreateSubmissionWithPointsResponse = Database["public"]["Functions"]["create_submission_with_points"]["Returns"];

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
};

type SupabaseRpc = {
  rpc(
    fn: "create_submission_with_points",
    args: CreateSubmissionWithPointsArgs,
  ): Promise<{ data: CreateSubmissionWithPointsResponse[] | CreateSubmissionWithPointsResponse | null; error: { code?: string; message: string } | null }>;
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

function canAutoApprove(aiResult: AIResult, riskFlags: string[]) {
  const threshold = Number(process.env.MIN_AI_CONFIDENCE ?? "0.75");

  return (
    isMvpAutoWasteType(aiResult.wasteType) &&
    aiResult.confidence >= threshold &&
    aiResult.isValidSubmission === true &&
    aiResult.imageQuality === "good" &&
    aiResult.objectCount > 0 &&
    aiResult.objectCount <= 3 &&
    aiResult.contaminationRisk !== "high" &&
    riskFlags.length === 0
  );
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
  const autoApproved = canAutoApprove(aiResult, riskFlags);
  const points = autoApproved ? calculatePoints(aiResult.wasteType) : 0;
  const status: SubmissionStatus = autoApproved ? "approved" : "pending_review";
  const reason = autoApproved ? `AI tự động duyệt: ${mvpWasteTypeLabel(aiResult.wasteType)}.` : riskFlags.length ? "AI đã phát hiện rủi ro, chờ admin kiểm tra." : "AI đã phân tích, chờ admin duyệt.";

  const rpc = supabase as unknown as SupabaseRpc;
  const { data, error } = await rpc.rpc("create_submission_with_points", {
    scan_session_id: session.id,
    image_url: imageUrl,
    ai_result: aiResult as unknown as Json,
    status,
    points,
    reason,
    risk_flags: riskFlags,
    reviewed_at: autoApproved ? new Date().toISOString() : null,
  });
  const createdSubmission = Array.isArray(data) ? data[0] : data;

  if (error?.code === "23505") {
    return NextResponse.json({ error: "Phiên QR này đã được sử dụng." }, { status: 400 });
  }

  if (error?.message.includes("scan_session_expired")) {
    return NextResponse.json({ error: "Phiên QR đã hết hạn." }, { status: 400 });
  }

  if (error || !createdSubmission) {
    return NextResponse.json({ error: "Không tạo được lượt gửi." }, { status: 500 });
  }

  return NextResponse.json({ submission: { id: createdSubmission.submission_id } });
}
