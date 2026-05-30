import { describe, expect, it } from "vitest";
import { calculateSubmissionDecision } from "./risk-score";

describe("calculateSubmissionDecision", () => {
  it("approves confident submissions with valid session and location", () => {
    const decision = calculateSubmissionDecision(
      { wasteType: "plastic_bottle", confidence: 0.91, objectCount: 1, imageQuality: "good" },
      { qrValid: true, sessionValid: true, binActive: true, gpsWithinRadius: true, dailyLimitReached: false, duplicateImage: false },
    );

    expect(decision.status).toBe("approved");
    expect(decision.points).toBe(10);
  });

  it("sends low confidence submissions to manual review", () => {
    const decision = calculateSubmissionDecision(
      { wasteType: "paper", confidence: 0.52, objectCount: 1, imageQuality: "good" },
      { qrValid: true, sessionValid: true, binActive: true, gpsWithinRadius: true, dailyLimitReached: false, duplicateImage: false },
    );

    expect(decision.status).toBe("pending_review");
    expect(decision.points).toBe(0);
  });

  it("rejects invalid sessions and daily limit violations", () => {
    expect(
      calculateSubmissionDecision(
        { wasteType: "metal_can", confidence: 0.95, objectCount: 1, imageQuality: "good" },
        { qrValid: true, sessionValid: false, binActive: true, gpsWithinRadius: true, dailyLimitReached: false, duplicateImage: false },
      ).status,
    ).toBe("rejected");

    expect(
      calculateSubmissionDecision(
        { wasteType: "metal_can", confidence: 0.95, objectCount: 1, imageQuality: "good" },
        { qrValid: true, sessionValid: true, binActive: true, gpsWithinRadius: true, dailyLimitReached: true, duplicateImage: false },
      ).status,
    ).toBe("rejected");
  });
});
