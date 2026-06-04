import { describe, expect, it } from "vitest";
import { buildFraudAlertsViewModel, type FraudProfileRow, type FraudSubmissionRow } from "./fraud-alerts-metrics";

const profiles: FraudProfileRow[] = [
  {
    bio: null,
    email: "user@seatech.app",
    full_name: "Lê Trung",
    id: "user-1",
    location: "Đà Nẵng",
    phone: null,
    role: "user",
    status: "active",
    trust_score: 80,
  },
];

const submissions: FraudSubmissionRow[] = [
  {
    ai_result: { confidence: 0.92, wasteType: "plastic" },
    bin_id: "bin-1",
    created_at: "2026-06-03T08:00:00.000Z",
    id: "submission-location",
    reason: "",
    risk_flags: ["location_mismatch"],
    status: "pending_review",
    user_id: "user-1",
  },
  {
    ai_result: { confidence: 0.98, wasteType: "paper" },
    bin_id: "bin-1",
    created_at: "2026-06-03T09:00:00.000Z",
    id: "submission-duplicate",
    reason: "",
    risk_flags: ["duplicate_image"],
    status: "pending_review",
    user_id: "missing-user",
  },
  {
    ai_result: { mode: "manual_review" },
    bin_id: "bin-2",
    created_at: "2026-06-03T10:00:00.000Z",
    id: "submission-spam",
    reason: "",
    risk_flags: ["rate_limit"],
    status: "pending_review",
    user_id: "user-1",
  },
  {
    ai_result: { wasteType: "unknown" },
    bin_id: "bin-3",
    created_at: "2026-06-03T11:00:00.000Z",
    id: "submission-rejected",
    reason: "Ảnh không hợp lệ",
    risk_flags: [],
    status: "rejected",
    user_id: "user-1",
  },
  {
    ai_result: { confidence: 0.9, wasteType: "glass" },
    bin_id: "bin-3",
    created_at: "2026-06-03T12:00:00.000Z",
    id: "submission-normal",
    reason: "",
    risk_flags: [],
    status: "approved",
    user_id: "user-1",
  },
];

describe("buildFraudAlertsViewModel", () => {
  it("builds fraud alerts from real risk flags and rejected submissions", () => {
    const viewModel = buildFraudAlertsViewModel({ profiles, submissions });

    expect(viewModel.totalAlerts).toBe(4);
    expect(viewModel.metrics).toEqual({
      duplicate: 1,
      location: 1,
      newAlerts: 4,
      spam: 1,
    });
    expect(viewModel.riskCounts).toEqual({ high: 3, low: 1, medium: 0 });
    expect(viewModel.alerts[0]).toMatchObject({
      category: "location",
      handle: "user",
      issue: "Vị trí quét bất thường",
      name: "Lê Trung",
      risk: "high",
    });
    expect(viewModel.alerts[1]).toMatchObject({
      handle: "missing-",
      name: "Người dùng missing-",
    });
  });

  it("filters alerts by risk", () => {
    const viewModel = buildFraudAlertsViewModel({ profiles, riskFilter: "low", submissions });

    expect(viewModel.alerts).toHaveLength(1);
    expect(viewModel.alerts[0].id).toBe("submission-spam");
  });
});
