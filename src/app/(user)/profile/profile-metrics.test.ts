import { describe, expect, it } from "vitest";
import { buildProfileMetrics } from "./profile-metrics";

describe("buildProfileMetrics", () => {
  it("derives tier, impact, contribution count, chart, and achievements from real rows", () => {
    const metrics = buildProfileMetrics({
      now: new Date("2026-06-03T00:00:00.000Z"),
      points: 1600,
      submissions: [
        {
          id: "sub-1",
          ai_result: { wasteType: "plastic" },
          status: "approved",
          points: 10,
          created_at: "2026-06-01T00:00:00.000Z",
        },
        {
          id: "sub-2",
          ai_result: { wasteType: "paper" },
          status: "approved",
          points: 6,
          created_at: "2026-05-15T00:00:00.000Z",
        },
        {
          id: "sub-3",
          ai_result: { wasteType: "unknown" },
          status: "pending_review",
          points: 0,
          created_at: "2026-04-15T00:00:00.000Z",
        },
      ],
      redemptions: [
        {
          id: "redeem-1",
          reward_item_id: "reward-donation",
          points_spent: 80,
          created_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      rewards: [{ id: "reward-donation", category: "Đóng góp" }],
    });

    expect(metrics.tierName).toBe("Bạch kim");
    expect(metrics.nextRank).toBe(5000);
    expect(metrics.progress).toBe(32);
    expect(metrics.approvedCount).toBe(2);
    expect(metrics.pendingCount).toBe(1);
    expect(metrics.contributionCount).toBe(1);
    expect(metrics.co2KgLabel).toBe("0,33");
    expect(metrics.chart.map((point) => [point.label, point.approvedCount])).toEqual([
      ["T1", 0],
      ["T2", 0],
      ["T3", 0],
      ["T4", 0],
      ["T5", 1],
      ["T6", 1],
    ]);
    expect(metrics.achievements.map((achievement) => achievement.title)).toEqual(["Đã xác thực lượt đầu", "Dấu chân carbon thấp hơn", "Đóng góp xanh"]);
  });
});
