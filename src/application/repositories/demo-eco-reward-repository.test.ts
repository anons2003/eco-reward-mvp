import { describe, expect, it } from "vitest";
import { demoEcoRewardRepository } from "@/infrastructure/repositories/demo-eco-reward-repository";

describe("demoEcoRewardRepository", () => {
  it("exposes the user MVP flow through a repository boundary", async () => {
    const scan = demoEcoRewardRepository.createScanSession({
      qrCode: "ECO-BIN-A1",
      lat: 10.7769,
      lng: 106.7009,
    });

    expect(scan.ok).toBe(true);
    if (!scan.ok) throw new Error("Expected scan session");

    const submission = await demoEcoRewardRepository.createSubmission({
      scanSessionId: scan.session.id,
      imageUrl: "https://example.com/plastic-clean-architecture.jpg",
    });

    expect(submission.status).toBe("approved");
    expect(demoEcoRewardRepository.getSubmission(submission.id)?.id).toBe(submission.id);
  });
});
