import { describe, expect, it } from "vitest";
import { buildAdminDashboardMetrics, type AdminDashboardBinRow, type AdminDashboardPointTransactionRow, type AdminDashboardProfileRow, type AdminDashboardSubmissionRow } from "./admin-dashboard-metrics";

const profiles: AdminDashboardProfileRow[] = [
  { email: "user@seatech.app", full_name: "Lê Trung", id: "user-1", role: "user", status: "active" },
  { email: "second@seatech.app", full_name: "Nguyễn An", id: "user-2", role: "user", status: "active" },
  { email: "admin@seatech.app", full_name: "Admin", id: "admin-1", role: "admin", status: "active" },
  { email: "blocked@seatech.app", full_name: "Blocked", id: "user-blocked", role: "user", status: "blocked" },
];

const bins: AdminDashboardBinRow[] = [
  { active: true, id: "bin-1", name: "Thùng Helio" },
  { active: false, id: "bin-2", name: "Thùng tạm tắt" },
];

const pointTransactions: AdminDashboardPointTransactionRow[] = [
  { created_at: "2026-06-01T08:00:00.000Z", points: 10 },
  { created_at: "2026-06-02T08:00:00.000Z", points: 5 },
  { created_at: "2026-06-03T08:00:00.000Z", points: -1 },
];

const submissions: AdminDashboardSubmissionRow[] = [
  {
    ai_result: { confidence: 0.93, wasteType: "plastic_bottle" },
    bin_id: "bin-1",
    created_at: "2026-06-01T08:00:00.000Z",
    id: "submission-approved-plastic",
    points: 10,
    reason: "",
    risk_flags: [],
    status: "approved",
    user_id: "user-1",
  },
  {
    ai_result: { confidence: 0.75, wasteType: "organic" },
    bin_id: "bin-1",
    created_at: "2026-06-02T08:00:00.000Z",
    id: "submission-approved-organic",
    points: 5,
    reason: "",
    risk_flags: [],
    status: "approved",
    user_id: "user-2",
  },
  {
    ai_result: { mode: "manual_review" },
    bin_id: "bin-2",
    created_at: "2026-06-03T08:00:00.000Z",
    id: "submission-pending",
    points: 0,
    reason: "",
    risk_flags: ["low_confidence"],
    status: "pending_review",
    user_id: "user-1",
  },
  {
    ai_result: { confidence: 0.1, wasteType: "unknown" },
    bin_id: "bin-1",
    created_at: "2026-06-04T08:00:00.000Z",
    id: "submission-rejected",
    points: 0,
    reason: "Ảnh không rõ",
    risk_flags: [],
    status: "rejected",
    user_id: "missing-user",
  },
];

describe("buildAdminDashboardMetrics", () => {
  it("builds admin dashboard metrics from real database rows instead of demo values", () => {
    const metrics = buildAdminDashboardMetrics({
      bins,
      now: new Date("2026-06-07T12:00:00.000Z"),
      pointTransactions,
      profiles,
      submissions,
    });

    expect(metrics.stats).toMatchObject({
      approved: 2,
      pending: 1,
      pointsIssued: 15,
      rejected: 1,
      totalSubmissions: 4,
      userCount: 2,
    });
    expect(metrics.activeBins).toBe(1);
    expect(metrics.approvalRate).toBe(50);
    expect(metrics.wasteLabel).toBe("0,1kg");
    expect(metrics.reviewRows).toEqual([
      {
        confidence: 0,
        id: "submission-pending",
        userInitial: "L",
        userName: "Lê Trung",
        wasteLabel: "Duyệt thủ công",
      },
    ]);
    expect(metrics.weeklyCollection[0]).toMatchObject({ mobileDay: "T2", recyclable: 100, organic: 0 });
    expect(metrics.weeklyCollection[1]).toMatchObject({ mobileDay: "T3", recyclable: 0, organic: 100 });
    expect(metrics.wasteDistribution.map((item) => [item.desktopLabel, item.value])).toEqual([
      ["Chai nhựa", 50],
      ["Hữu cơ", 50],
    ]);
    expect(metrics.alerts.map((alert) => alert.title)).toEqual(["Lượt gửi chờ duyệt", "Tỷ lệ từ chối cần theo dõi", "Thùng chưa hoạt động"]);
  });
});
