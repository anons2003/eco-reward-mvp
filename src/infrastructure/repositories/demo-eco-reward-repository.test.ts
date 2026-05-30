import { describe, expect, it } from "vitest";
import { createScanSession, createSubmission, getSubmission, reviewSubmission } from "./demo-eco-reward-repository";

describe("demoEcoRewardRepository integration flow", () => {
  it("creates a scan session from a valid QR and creates an approved submission", async () => {
    const scan = createScanSession({ qrCode: "ECO-BIN-A1", lat: 10.7769, lng: 106.7009 });

    expect(scan.ok).toBe(true);
    if (!scan.ok) throw new Error("Expected scan session");

    const submission = await createSubmission({
      scanSessionId: scan.session.id,
      imageUrl: "https://example.com/plastic-demo.jpg",
    });

    expect(submission.status).toBe("approved");
    expect(submission.points).toBe(10);
    expect(getSubmission(submission.id)?.id).toBe(submission.id);
  });

  it("lets admin reject a pending submission and records the decision", async () => {
    const scan = createScanSession({ qrCode: "ECO-BIN-A1" });

    expect(scan.ok).toBe(true);
    if (!scan.ok) throw new Error("Expected scan session");

    const submission = await createSubmission({
      scanSessionId: scan.session.id,
      imageUrl: `https://example.com/paper-${Date.now()}.jpg`,
    });

    const result = reviewSubmission({
      submissionId: submission.id,
      decision: "rejected",
      reason: "Ảnh không thể hiện rõ thao tác bỏ rác.",
    });

    expect(result.ok).toBe(true);
    expect(getSubmission(submission.id)?.status).toBe("rejected");
    expect(getSubmission(submission.id)?.reason).toBe("Ảnh không thể hiện rõ thao tác bỏ rác.");
  });
});
