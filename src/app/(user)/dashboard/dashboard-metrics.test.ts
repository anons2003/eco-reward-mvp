import { describe, expect, it } from "vitest";
import { buildDashboardMetrics, buildPreferredRewards, dashboardWasteLabel } from "./dashboard-metrics";

describe("buildDashboardMetrics", () => {
  it("derives weekly chart, impact metrics, rank, and nearest bin from real rows", () => {
    const metrics = buildDashboardMetrics({
      now: new Date("2026-06-03T12:00:00.000Z"),
      currentUserId: "user-2",
      currentPoints: 70,
      submissions: [
        {
          id: "sub-1",
          bin_id: "bin-a",
          ai_result: { wasteType: "plastic_bottle" },
          status: "approved",
          points: 10,
          created_at: "2026-06-03T09:00:00.000Z",
        },
        {
          id: "sub-2",
          bin_id: "bin-b",
          ai_result: { wasteType: "paper" },
          status: "pending_review",
          points: 5,
          created_at: "2026-06-02T08:00:00.000Z",
        },
        {
          id: "sub-3",
          bin_id: "bin-c",
          ai_result: { wasteType: "metal_can" },
          status: "approved",
          points: 40,
          created_at: "2026-06-01T10:00:00.000Z",
        },
      ],
      bins: [
        { id: "bin-a", location_name: "Helio Center" },
        { id: "bin-b", location_name: "Công viên APEC" },
        { id: "bin-c", location_name: "Biển Đông" },
      ],
      profiles: [
        { id: "user-1", points: 120 },
        { id: "user-2", points: 70 },
        { id: "user-3", points: 10 },
      ],
    });

    expect(metrics.weeklyTrend.map((item) => item.count)).toEqual([1, 1, 1, 0, 0, 0, 0]);
    expect(metrics.weeklyTrend.map((item) => item.height)).toEqual([100, 100, 100, 0, 0, 0, 0]);
    expect(metrics.approvedCount).toBe(2);
    expect(metrics.co2Label).toBe("0,43 kg");
    expect(metrics.rankLabel).toBe("#2");
    expect(metrics.percentileLabel).toBe("Top 67%");
    expect(metrics.nearestBinLabel).toBe("Helio Center");
  });

  it("returns empty-state labels when the user has no activity", () => {
    const metrics = buildDashboardMetrics({
      now: new Date("2026-06-03T12:00:00.000Z"),
      currentUserId: "user-1",
      currentPoints: 0,
      submissions: [],
      bins: [],
      profiles: [],
    });

    expect(metrics.weeklyTrend.every((item) => item.count === 0 && item.height === 0)).toBe(true);
    expect(metrics.co2Label).toBe("0 kg");
    expect(metrics.rankLabel).toBe("Chưa có");
    expect(metrics.percentileLabel).toBe("Chưa xếp hạng");
    expect(metrics.nearestBinLabel).toBe("Chưa có");
  });

  it("uses user-facing labels instead of raw unknown values", () => {
    expect(dashboardWasteLabel({ mode: "manual_review" }, "pending_review")).toBe("Chờ duyệt phân loại");
    expect(dashboardWasteLabel({ wasteType: "plastic_bottle" }, "approved")).toBe("Chai nhựa");
    expect(dashboardWasteLabel({ wasteType: "unknown" }, "rejected")).toBe("Chưa xác định");
  });

  it("orders matching rewards by redeemable first then closest point target", () => {
    const rewards = buildPreferredRewards({
      points: 100,
      limit: 3,
      rewards: [
        { id: "expensive", title: "Cần thêm ít", description: "", points_required: 120, stock: 3, image_url: null },
        { id: "affordable", title: "Đổi được", description: "", points_required: 80, stock: 1, image_url: null },
        { id: "far", title: "Còn xa", description: "", points_required: 450, stock: 10, image_url: null },
        { id: "empty", title: "Hết hàng", description: "", points_required: 50, stock: 0, image_url: null },
      ],
    });

    expect(rewards.map((reward) => reward.id)).toEqual(["affordable", "expensive", "far"]);
    expect(rewards[0].actionLabel).toBe("Đổi ngay");
    expect(rewards[1].actionLabel).toBe("Cần thêm 20 điểm");
  });
});
