import type { Database, Json } from "@/infrastructure/supabase/database.types";

export type AdminDashboardProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "role" | "status">;
export type AdminDashboardBinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "active">;
export type AdminDashboardSubmissionRow = Pick<
  Database["public"]["Tables"]["submissions"]["Row"],
  "id" | "user_id" | "bin_id" | "ai_result" | "status" | "points" | "risk_flags" | "reason" | "created_at"
>;
export type AdminDashboardPointTransactionRow = Pick<Database["public"]["Tables"]["point_transactions"]["Row"], "points" | "created_at">;

type JsonRecord = Record<string, Json | undefined>;

type AlertTone = "red" | "amber" | "blue" | "green";

export type AdminDashboardAlert = {
  title: string;
  body: string;
  label: string;
  tone: AlertTone;
};

export type AdminDashboardReviewRow = {
  id: string;
  userName: string;
  userInitial: string;
  wasteLabel: string;
  confidence: number;
};

export type AdminDashboardWasteDistribution = {
  desktopLabel: string;
  mobileLabel: string;
  value: number;
  color: string;
};

export type AdminDashboardMetrics = {
  activeBins: number;
  alerts: AdminDashboardAlert[];
  approvalRate: number;
  reviewRows: AdminDashboardReviewRow[];
  stats: {
    approved: number;
    pending: number;
    pointsIssued: number;
    rejected: number;
    totalSubmissions: number;
    userCount: number;
  };
  wasteDistribution: AdminDashboardWasteDistribution[];
  wasteLabel: string;
  weeklyCollection: Array<{
    day: string;
    mobileDay: string;
    organic: number;
    recyclable: number;
  }>;
};

const wasteTypeLabels: Record<string, string> = {
  cardboard: "Bìa carton",
  glass_bottle: "Thủy tinh",
  hazardous: "Nguy hại",
  manual_review: "Duyệt thủ công",
  metal_can: "Lon kim loại",
  organic: "Hữu cơ",
  paper: "Giấy",
  plastic_bottle: "Chai nhựa",
  unknown: "Chưa xác định",
};

const wasteTypeWeightsKg: Record<string, number> = {
  cardboard: 0.05,
  glass_bottle: 0.2,
  hazardous: 0.05,
  metal_can: 0.02,
  organic: 0.1,
  paper: 0.01,
  plastic_bottle: 0.03,
  unknown: 0.03,
};

const distributionColors = ["#006d37", "#006496", "#f39c12", "#2ecc71", "#6e7a70"];
const dayLabels = [
  ["Mon", "T2"],
  ["Tue", "T3"],
  ["Wed", "T4"],
  ["Thu", "T5"],
  ["Fri", "T6"],
  ["Sat", "T7"],
  ["Sun", "CN"],
] as const;

function aiResultObject(value: Json): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function wasteTypeFromAi(value: Json) {
  const result = aiResultObject(value);
  if (typeof result.wasteType === "string") {
    return result.wasteType;
  }
  if (typeof result.mode === "string") {
    return "manual_review";
  }
  return "unknown";
}

function confidenceFromAi(value: Json) {
  const result = aiResultObject(value);
  return typeof result.confidence === "number" ? Math.round(result.confidence * 100) : 0;
}

function wasteLabel(value: Json) {
  const wasteType = wasteTypeFromAi(value);
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

function formatWasteKg(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}t`;
  }
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}kg`;
}

function fallbackName(id: string) {
  return `Người dùng ${id.slice(0, 8)}`;
}

export function buildAdminDashboardMetrics({
  bins,
  now = new Date(),
  pointTransactions,
  profiles,
  submissions,
}: {
  bins: AdminDashboardBinRow[];
  now?: Date;
  pointTransactions: AdminDashboardPointTransactionRow[];
  profiles: AdminDashboardProfileRow[];
  submissions: AdminDashboardSubmissionRow[];
}): AdminDashboardMetrics {
  const approvedSubmissions = submissions.filter((submission) => submission.status === "approved");
  const pendingSubmissions = submissions.filter((submission) => submission.status === "pending_review");
  const rejectedSubmissions = submissions.filter((submission) => submission.status === "rejected");
  const userCount = profiles.filter((profile) => profile.role === "user" && profile.status === "active").length;
  const activeBins = bins.filter((bin) => bin.active).length;
  const inactiveBins = bins.length - activeBins;
  const pointsIssued = pointTransactions.reduce((total, transaction) => total + Math.max(transaction.points, 0), 0);
  const approvalRate = Math.round((approvedSubmissions.length / Math.max(submissions.length, 1)) * 100);
  const wasteKg = approvedSubmissions.reduce((total, submission) => {
    const type = wasteTypeFromAi(submission.ai_result);
    return total + (wasteTypeWeightsKg[type] ?? wasteTypeWeightsKg.unknown);
  }, 0);

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const reviewSource = pendingSubmissions.length ? pendingSubmissions : submissions.slice(0, 3);
  const reviewRows = reviewSource.slice(0, 3).map((submission) => {
    const profile = profileById.get(submission.user_id);
    const userName = profile?.full_name || profile?.email || fallbackName(submission.user_id);
    return {
      confidence: confidenceFromAi(submission.ai_result),
      id: submission.id,
      userInitial: userName.trim().slice(0, 1).toUpperCase() || "U",
      userName,
      wasteLabel: wasteLabel(submission.ai_result),
    };
  });

  const weekStart = startOfWeekMonday(now);
  const rawWeeklyCollection = dayLabels.map(([day, mobileDay], index) => {
    const target = new Date(weekStart);
    target.setDate(weekStart.getDate() + index);
    const daySubmissions = approvedSubmissions.filter((submission) => sameLocalDate(new Date(submission.created_at), target));
    return {
      day,
      mobileDay,
      organicCount: daySubmissions.filter((submission) => wasteTypeFromAi(submission.ai_result) === "organic").length,
      recyclableCount: daySubmissions.filter((submission) => wasteTypeFromAi(submission.ai_result) !== "organic").length,
    };
  });
  const maxWeeklyCount = Math.max(1, ...rawWeeklyCollection.flatMap((item) => [item.organicCount, item.recyclableCount]));
  const weeklyCollection = rawWeeklyCollection.map((item) => ({
    day: item.day,
    mobileDay: item.mobileDay,
    organic: Math.round((item.organicCount / maxWeeklyCount) * 100),
    recyclable: Math.round((item.recyclableCount / maxWeeklyCount) * 100),
  }));

  const distributionCounts = new Map<string, number>();
  for (const submission of approvedSubmissions) {
    const label = wasteLabel(submission.ai_result);
    distributionCounts.set(label, (distributionCounts.get(label) ?? 0) + 1);
  }
  const wasteDistribution = Array.from(distributionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count], index) => ({
      color: distributionColors[index] ?? "#6e7a70",
      desktopLabel: label,
      mobileLabel: label,
      value: Math.round((count / Math.max(approvedSubmissions.length, 1)) * 100),
    }));

  const alerts: AdminDashboardAlert[] = [];
  if (pendingSubmissions.length > 0) {
    alerts.push({
      body: `${pendingSubmissions.length.toLocaleString("vi-VN")} lượt gửi cần quản trị viên kiểm duyệt.`,
      label: "Kiểm duyệt",
      title: "Lượt gửi chờ duyệt",
      tone: "amber",
    });
  }
  if (rejectedSubmissions.length > 0) {
    alerts.push({
      body: `${rejectedSubmissions.length.toLocaleString("vi-VN")} lượt gửi bị từ chối, cần rà soát nếu tỷ lệ tăng bất thường.`,
      label: "Chất lượng",
      title: "Tỷ lệ từ chối cần theo dõi",
      tone: "red",
    });
  }
  if (inactiveBins > 0) {
    alerts.push({
      body: `${inactiveBins.toLocaleString("vi-VN")} thùng đang tắt, người dùng sẽ không tạo được phiên quét tại các thùng này.`,
      label: "Thiết bị",
      title: "Thùng chưa hoạt động",
      tone: "blue",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      body: "Không có lượt chờ duyệt, từ chối hoặc thùng ngừng hoạt động trong dữ liệu hiện tại.",
      label: "Ổn định",
      title: "Hệ thống đang ổn định",
      tone: "green",
    });
  }

  return {
    activeBins,
    alerts,
    approvalRate,
    reviewRows,
    stats: {
      approved: approvedSubmissions.length,
      pending: pendingSubmissions.length,
      pointsIssued,
      rejected: rejectedSubmissions.length,
      totalSubmissions: submissions.length,
      userCount,
    },
    wasteDistribution,
    wasteLabel: formatWasteKg(wasteKg),
    weeklyCollection,
  };
}
