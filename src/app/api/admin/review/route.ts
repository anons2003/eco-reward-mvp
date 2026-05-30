import { NextResponse } from "next/server";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export async function POST(request: Request) {
  const body = (await request.json()) as { submissionId?: string; decision?: "approved" | "rejected"; reason?: string };

  if (!body.submissionId || !body.decision || !body.reason) {
    return NextResponse.json({ error: "submissionId, decision và reason là bắt buộc." }, { status: 400 });
  }

  const result = ecoRewardService.reviewSubmission({
    submissionId: body.submissionId,
    decision: body.decision,
    reason: body.reason,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ submission: result.submission });
}
