import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { Database } from "@/infrastructure/supabase/database.types";

type ReviewDecision = "approved" | "rejected";
type SubmissionReviewRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "user_id" | "status" | "points" | "reason">;
type SubmissionUpdate = {
  status: ReviewDecision;
  reason: string;
  reviewed_at: string;
  reviewed_by: string;
};
type ProfilePointsRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "points">;
type PointTransactionInsert = Database["public"]["Tables"]["point_transactions"]["Insert"];
type AuditInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

type SubmissionTable = {
  select(columns: string): {
    eq(column: "id", value: string): {
      single(): Promise<{ data: SubmissionReviewRow | null; error: { message: string } | null }>;
    };
  };
  update(values: SubmissionUpdate): {
    eq(column: "id", value: string): {
      select(columns: string): {
        single(): Promise<{ data: SubmissionReviewRow | null; error: { message: string } | null }>;
      };
    };
  };
};

type ProfileTable = {
  select(columns: "points"): {
    eq(column: "id", value: string): {
      single(): Promise<{ data: ProfilePointsRow | null; error: { message: string } | null }>;
    };
  };
  update(values: Pick<ProfilePointsRow, "points">): {
    eq(column: "id", value: string): Promise<{ error: { message: string } | null }>;
  };
};

type InsertTable<T> = {
  insert(values: T): Promise<{ error: { message: string } | null }>;
};

function isReviewDecision(value: unknown): value is ReviewDecision {
  return value === "approved" || value === "rejected";
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
  const submissions = supabase.from("submissions") as unknown as SubmissionTable;
  const { data: currentSubmission, error: currentError } = await submissions.select("id,user_id,status,points,reason").eq("id", submissionId).single();

  if (currentError || !currentSubmission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: submission, error: updateError } = await submissions
    .update({
      status: decision,
      reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.actorId,
    })
    .eq("id", submissionId)
    .select("id,user_id,status,points,reason")
    .single();

  if (updateError || !submission) {
    return NextResponse.json({ error: "Unable to review submission" }, { status: 500 });
  }

  const shouldIssuePoints = decision === "approved" && currentSubmission.status !== "approved" && currentSubmission.points > 0;

  if (shouldIssuePoints) {
    const profiles = supabase.from("profiles") as unknown as ProfileTable;
    const { data: profile, error: profileReadError } = await profiles.select("points").eq("id", currentSubmission.user_id).single();

    if (profileReadError || !profile) {
      return NextResponse.json({ error: "Unable to load user wallet" }, { status: 500 });
    }

    const { error: profileUpdateError } = await profiles.update({ points: profile.points + currentSubmission.points }).eq("id", currentSubmission.user_id);

    if (profileUpdateError) {
      return NextResponse.json({ error: "Unable to update user wallet" }, { status: 500 });
    }

    const pointTransactions = supabase.from("point_transactions") as unknown as InsertTable<PointTransactionInsert>;
    const { error: transactionError } = await pointTransactions.insert({
      user_id: currentSubmission.user_id,
      submission_id: currentSubmission.id,
      points: currentSubmission.points,
      reason,
    });

    if (transactionError) {
      return NextResponse.json({ error: "Unable to write point transaction" }, { status: 500 });
    }
  }

  const auditLogs = supabase.from("audit_logs") as unknown as InsertTable<AuditInsert>;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.submission.review",
    target_id: submissionId,
    metadata: { decision, points: shouldIssuePoints ? currentSubmission.points : 0 },
  });

  return NextResponse.json({ submission });
}
