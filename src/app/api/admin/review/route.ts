import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { Database } from "@/infrastructure/supabase/database.types";

type ReviewDecision = "approved" | "rejected";
type ReviewSubmissionWithPointsArgs = Database["public"]["Functions"]["review_submission_with_points"]["Args"];
type ReviewSubmissionWithPointsResponse = Database["public"]["Functions"]["review_submission_with_points"]["Returns"];

type AdminReviewRpc = {
  rpc(
    fn: "review_submission_with_points",
    args: ReviewSubmissionWithPointsArgs,
  ): Promise<{ data: ReviewSubmissionWithPointsResponse[] | ReviewSubmissionWithPointsResponse | null; error: { message: string } | null }>;
};

function isReviewDecision(value: unknown): value is ReviewDecision {
  return value === "approved" || value === "rejected";
}

function reviewErrorResponse(message: string) {
  if (message.includes("submission_not_found")) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (message.includes("invalid_review_payload") || message.includes("invalid_review_decision")) {
    return NextResponse.json({ error: "submissionId, decision và reason là bắt buộc." }, { status: 400 });
  }
  if (message.includes("admin_profile_not_found")) {
    return NextResponse.json({ error: "Admin account is not allowed to review submissions" }, { status: 403 });
  }
  return NextResponse.json({ error: "Unable to review submission" }, { status: 500 });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = (await request.json().catch(() => null)) as { submissionId?: unknown; decision?: unknown; reason?: unknown } | null;
  const submissionId = typeof body?.submissionId === "string" ? body.submissionId.trim() : "";
  const decision = body?.decision;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!submissionId || !isReviewDecision(decision) || !reason) {
    return NextResponse.json({ error: "submissionId, decision và reason là bắt buộc." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const rpc = supabase as unknown as AdminReviewRpc;
  const { data, error } = await rpc.rpc("review_submission_with_points", {
    p_admin_id: admin.actorId,
    p_submission_id: submissionId,
    p_decision: decision,
    p_reason: reason,
  });
  const submission = Array.isArray(data) ? data[0] : data;

  if (error) return reviewErrorResponse(error.message);
  if (!submission) return NextResponse.json({ error: "Unable to review submission" }, { status: 500 });

  return NextResponse.json({ submission });
}
