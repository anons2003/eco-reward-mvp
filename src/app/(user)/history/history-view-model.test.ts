import { describe, expect, it } from "vitest";
import { buildHistoryViewModel } from "./history-view-model";

describe("buildHistoryViewModel", () => {
  it("combines real submissions, bins, and redemptions into newest-first history", () => {
    const viewModel = buildHistoryViewModel({
      submissions: [
        {
          id: "sub-pending",
          bin_id: "bin-a",
          image_url: "data:image/jpeg;base64,pending",
          ai_result: { mode: "manual_review" },
          status: "pending_review",
          points: 10,
          reason: "Chờ admin duyệt thủ công.",
          risk_flags: [],
          created_at: "2026-06-02T02:00:00.000Z",
        },
        {
          id: "sub-approved",
          bin_id: "bin-b",
          image_url: "https://example.test/approved.jpg",
          ai_result: { wasteType: "plastic_bottle", confidence: 0.91 },
          status: "approved",
          points: 15,
          reason: "Đã duyệt.",
          risk_flags: [],
          created_at: "2026-06-02T01:00:00.000Z",
        },
        {
          id: "sub-rejected",
          bin_id: "bin-a",
          image_url: "https://example.test/rejected.jpg",
          ai_result: { wasteType: "unknown" },
          status: "rejected",
          points: 0,
          reason: "Ảnh không hợp lệ.",
          risk_flags: ["Ảnh mờ"],
          created_at: "2026-06-01T23:00:00.000Z",
        },
      ],
      bins: [
        { id: "bin-a", name: "Thùng A", location_name: "Sảnh A" },
        { id: "bin-b", name: "Thùng B", location_name: "Sảnh B" },
      ],
      redemptions: [
        {
          id: "redeem-1",
          reward_item_id: "reward-1",
          points_spent: 5,
          status: "completed",
          created_at: "2026-06-02T01:30:00.000Z",
        },
      ],
    });

    expect(viewModel.summary).toEqual({
      totalSubmissions: 3,
      approvedSubmissions: 1,
      pendingSubmissions: 1,
      rejectedSubmissions: 1,
      pointsEarned: 15,
      pendingPoints: 10,
      pointsSpent: 5,
      redemptionCount: 1,
    });
    expect(viewModel.rows.map((row) => row.id)).toEqual(["sub-pending", "redeem-1", "sub-approved", "sub-rejected"]);
    expect(viewModel.rows[0]).toMatchObject({
      kind: "submission",
      id: "sub-pending",
      title: "Phân loại Duyệt thủ công",
      pointsLabel: "+10 pts",
      imageUrl: "data:image/jpeg;base64,pending",
      binName: "Thùng A",
      binLocation: "Sảnh A",
    });
    expect(viewModel.rows[2]).toMatchObject({
      kind: "submission",
      id: "sub-approved",
      title: "Phân loại Chai nhựa",
      pointsLabel: "+15 pts",
      binName: "Thùng B",
    });
    expect(viewModel.rows[3]).toMatchObject({
      kind: "submission",
      id: "sub-rejected",
      title: "Phân loại Chưa xác định",
      pointsLabel: "0 pts",
      reason: "Ảnh không hợp lệ.",
    });
  });
});
