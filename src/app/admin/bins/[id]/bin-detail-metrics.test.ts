import { describe, expect, it } from "vitest";
import { buildBinDetailMetrics, type BinDetailProfileRow, type BinDetailSubmissionRow } from "./bin-detail-metrics";

const submissions: BinDetailSubmissionRow[] = [
  {
    ai_result: { confidence: 0.94, wasteType: "plastic" },
    created_at: "2026-06-01T08:00:00.000Z",
    id: "approved",
    points: 10,
    reason: "",
    risk_flags: [],
    status: "approved",
    user_id: "user-1",
  },
  {
    ai_result: { mode: "manual_review" },
    created_at: "2026-06-03T08:00:00.000Z",
    id: "pending",
    points: 0,
    reason: "Cần kiểm tra ảnh",
    risk_flags: ["low_confidence"],
    status: "pending_review",
    user_id: "user-2",
  },
  {
    ai_result: { confidence: 0.2, wasteType: "unknown" },
    created_at: "2026-06-04T08:00:00.000Z",
    id: "rejected",
    points: 0,
    reason: "Không thấy rác",
    risk_flags: ["no_visible_waste"],
    status: "rejected",
    user_id: "missing-user",
  },
];

const profiles: BinDetailProfileRow[] = [
  { email: "le@example.com", full_name: "Lê Trung", id: "user-1" },
  { email: "an@example.com", full_name: "Nguyễn An", id: "user-2" },
];

describe("buildBinDetailMetrics", () => {
  it("builds bin detail data from real submissions without synthetic telemetry", () => {
    const metrics = buildBinDetailMetrics({
      now: new Date("2026-06-07T12:00:00.000Z"),
      profiles,
      submissions,
    });

    expect(metrics.summary).toEqual({
      approved: 1,
      pending: 1,
      pointsIssued: 10,
      rejected: 1,
      total: 3,
    });
    expect(metrics.weeklySubmissions.map((item) => [item.day, item.count])).toEqual([
      ["T2", 1],
      ["T3", 0],
      ["T4", 1],
      ["T5", 1],
      ["T6", 0],
      ["T7", 0],
      ["CN", 0],
    ]);
    expect(metrics.recentEvents[0]).toMatchObject({
      actor: "Người dùng missing-",
      detail: "Chưa xác định · Không thấy rác",
      status: "Bị từ chối",
      tone: "red",
    });
    expect(metrics.recentEvents[2]).toMatchObject({
      actor: "Lê Trung",
      detail: "Nhựa · +10 điểm",
      status: "Đã duyệt",
      tone: "green",
    });
  });

  it("returns an empty real-data state when the bin has no submissions", () => {
    const metrics = buildBinDetailMetrics({ profiles: [], submissions: [] });

    expect(metrics.summary.total).toBe(0);
    expect(metrics.recentEvents).toEqual([]);
    expect(metrics.weeklySubmissions.every((item) => item.count === 0)).toBe(true);
  });
});
