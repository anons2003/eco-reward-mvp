import { describe, expect, it } from "vitest";
import { demoSeaTechRepository } from "@/infrastructure/repositories/demo-seatech-repository";

describe("demoSeaTechRepository", () => {
  it("exposes the user MVP flow through a repository boundary", async () => {
    const scan = demoSeaTechRepository.createScanSession({
      qrCode: "ECO-BIN-A1",
      lat: 10.7769,
      lng: 106.7009,
    });

    expect(scan.ok).toBe(true);
    if (!scan.ok) throw new Error("Expected scan session");

    const submission = await demoSeaTechRepository.createSubmission({
      scanSessionId: scan.session.id,
      imageUrl: "https://example.com/plastic-clean-architecture.jpg",
    });

    expect(submission.status).toBe("approved");
    expect(demoSeaTechRepository.getSubmission(submission.id)?.id).toBe(submission.id);
  });
});
