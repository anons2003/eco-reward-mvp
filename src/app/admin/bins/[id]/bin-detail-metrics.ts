import type { Database, Json } from "@/infrastructure/supabase/database.types";

export type BinDetailSubmissionRow = Pick<
  Database["public"]["Tables"]["submissions"]["Row"],
  "id" | "user_id" | "ai_result" | "status" | "points" | "reason" | "risk_flags" | "created_at"
>;
export type BinDetailProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name">;

type JsonRecord = Record<string, Json | undefined>;
type ActivityTone = "amber" | "green" | "red";

export type BinDetailRecentEvent = {
  action: string;
  actor: string;
  detail: string;
  status: string;
  time: string;
  tone: ActivityTone;
};

export type BinDetailMetrics = {
  recentEvents: BinDetailRecentEvent[];
  summary: {
    approved: number;
    pending: number;
    pointsIssued: number;
    rejected: number;
    total: number;
  };
  weeklySubmissions: Array<{
    count: number;
    day: string;
    height: number;
  }>;
};

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const wasteTypeLabels: Record<string, string> = {
  glass: "Thủy tinh",
  glass_bottle: "Thủy tinh",
  manual_review: "Duyệt thủ công",
  metal: "Kim loại",
  metal_can: "Kim loại",
  paper: "Giấy",
  plastic: "Nhựa",
  plastic_bottle: "Nhựa",
  unknown: "Chưa xác định",
};

const statusLabels: Record<BinDetailSubmissionRow["status"], string> = {
  approved: "Đã duyệt",
  pending_review: "Chờ duyệt",
  rejected: "Bị từ chối",
};

const statusActions: Record<BinDetailSubmissionRow["status"], string> = {
  approved: "Cộng điểm",
  pending_review: "Chờ kiểm tra",
  rejected: "Từ chối",
};

const statusTones: Record<BinDetailSubmissionRow["status"], ActivityTone> = {
  approved: "green",
  pending_review: "amber",
  rejected: "red",
};

function aiResultObject(value: Json): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function wasteLabel(value: Json) {
  const result = aiResultObject(value);
  const wasteType = typeof result.wasteType === "string" ? result.wasteType : typeof result.mode === "string" ? "manual_review" : "unknown";
  return wasteTypeLabels[wasteType] ?? wasteType.replaceAll("_", " ");
}

function startOfWeekMonday(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

function sameLocalDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function profileName(profile: BinDetailProfileRow | undefined, userId: string) {
  return profile?.full_name || profile?.email || `Người dùng ${userId.slice(0, 8)}`;
}

function eventDetail(submission: BinDetailSubmissionRow) {
  const label = wasteLabel(submission.ai_result);
  if (submission.status === "approved") return `${label} · +${submission.points.toLocaleString("vi-VN")} điểm`;
  if (submission.reason.trim()) return `${label} · ${submission.reason.trim()}`;
  if (submission.risk_flags.length > 0) return `${label} · ${submission.risk_flags.join(", ")}`;
  return label;
}

export function buildBinDetailMetrics({
  now = new Date(),
  profiles,
  submissions,
}: {
  now?: Date;
  profiles: BinDetailProfileRow[];
  submissions: BinDetailSubmissionRow[];
}): BinDetailMetrics {
  const summary = {
    approved: submissions.filter((submission) => submission.status === "approved").length,
    pending: submissions.filter((submission) => submission.status === "pending_review").length,
    pointsIssued: submissions.reduce((total, submission) => total + (submission.status === "approved" ? Math.max(submission.points, 0) : 0), 0),
    rejected: submissions.filter((submission) => submission.status === "rejected").length,
    total: submissions.length,
  };

  const weekStart = startOfWeekMonday(now);
  const rawWeeklySubmissions = dayLabels.map((day, index) => {
    const target = new Date(weekStart);
    target.setDate(weekStart.getDate() + index);
    return {
      count: submissions.filter((submission) => sameLocalDate(new Date(submission.created_at), target)).length,
      day,
    };
  });
  const maxWeeklyCount = Math.max(1, ...rawWeeklySubmissions.map((item) => item.count));
  const weeklySubmissions = rawWeeklySubmissions.map((item) => ({
    ...item,
    height: item.count > 0 ? Math.max(18, Math.round((item.count / maxWeeklyCount) * 100)) : 0,
  }));

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const recentEvents = submissions
    .toSorted((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((submission) => ({
      action: statusActions[submission.status],
      actor: profileName(profileById.get(submission.user_id), submission.user_id),
      detail: eventDetail(submission),
      status: statusLabels[submission.status],
      time: formatDateTime(submission.created_at),
      tone: statusTones[submission.status],
    }));

  return { recentEvents, summary, weeklySubmissions };
}
