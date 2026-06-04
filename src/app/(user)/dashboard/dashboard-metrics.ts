import type { Json } from "@/infrastructure/supabase/database.types";

export type DashboardMetricsSubmission = {
  id: string;
  bin_id: string;
  ai_result: Json;
  status: string;
  points: number;
  created_at: string;
};

export type DashboardMetricsBin = {
  id: string;
  location_name: string;
};

export type DashboardMetricsProfile = {
  id: string;
  points: number;
};

export type DashboardMetricsReward = {
  id: string;
  title: string;
  description: string;
  points_required: number;
  stock: number;
  image_url: string | null;
};

export type PreferredDashboardReward = DashboardMetricsReward & {
  canRedeem: boolean;
  actionLabel: string;
};

export type WeeklyTrendPoint = {
  label: string;
  count: number;
  height: number;
};

const weekLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const weekIndexByDay = [1, 2, 3, 4, 5, 6, 0];
const co2KgByWasteType: Record<string, number> = {
  plastic: 0.25,
  plastic_bottle: 0.25,
  metal: 0.18,
  metal_can: 0.18,
  paper: 0.08,
  cardboard: 0.1,
  glass: 0.16,
  glass_bottle: 0.16,
  organic: 0.04,
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function wasteTypeFromAi(value: Json) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "unknown";
  return typeof value.wasteType === "string" ? value.wasteType : "unknown";
}

export function dashboardWasteLabel(value: Json, status: string) {
  if (status === "pending_review") return "Chờ duyệt phân loại";

  const wasteType = wasteTypeFromAi(value);
  const labels: Record<string, string> = {
    plastic: "Nhựa",
    plastic_bottle: "Nhựa",
    metal: "Kim loại",
    metal_can: "Kim loại",
    paper: "Giấy",
    cardboard: "Chưa xác định",
    glass: "Thủy tinh",
    glass_bottle: "Thủy tinh",
    organic: "Chưa xác định",
    hazardous: "Chưa xác định",
    unknown: "Chưa xác định",
  };

  return labels[wasteType] ?? wasteType.replaceAll("_", " ");
}

function formatKg(value: number) {
  if (value <= 0) return "0 kg";
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} kg`;
}

export function buildPreferredRewards({
  points,
  rewards,
  limit = 2,
}: {
  points: number;
  rewards: DashboardMetricsReward[];
  limit?: number;
}): PreferredDashboardReward[] {
  return rewards
    .filter((reward) => reward.stock > 0)
    .map((reward) => {
      const pointsMissing = Math.max(0, reward.points_required - points);
      return {
        ...reward,
        canRedeem: pointsMissing === 0,
        actionLabel: pointsMissing === 0 ? "Đổi ngay" : `Cần thêm ${pointsMissing.toLocaleString("vi-VN")} điểm`,
      };
    })
    .sort((a, b) => {
      if (a.canRedeem !== b.canRedeem) return a.canRedeem ? -1 : 1;
      const aGap = Math.abs(a.points_required - points);
      const bGap = Math.abs(b.points_required - points);
      if (aGap !== bGap) return aGap - bGap;
      return a.points_required - b.points_required;
    })
    .slice(0, limit);
}

export function buildDashboardMetrics({
  now = new Date(),
  currentUserId,
  currentPoints,
  submissions,
  bins,
  profiles,
}: {
  now?: Date;
  currentUserId: string;
  currentPoints: number;
  submissions: DashboardMetricsSubmission[];
  bins: DashboardMetricsBin[];
  profiles: DashboardMetricsProfile[];
}) {
  const sevenDaysAgo = startOfDay(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const recentSubmissions = submissions.filter((submission) => Date.parse(submission.created_at) >= sevenDaysAgo.getTime());
  const dailyCounts = new Map<number, number>();

  for (const submission of recentSubmissions) {
    const date = new Date(submission.created_at);
    const day = date.getDay();
    dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
  }

  const maxDailyCount = Math.max(...weekIndexByDay.map((day) => dailyCounts.get(day) ?? 0), 0);
  const weeklyTrend: WeeklyTrendPoint[] = weekIndexByDay.map((day, index) => {
    const count = dailyCounts.get(day) ?? 0;
    return {
      label: weekLabels[index],
      count,
      height: maxDailyCount > 0 && count > 0 ? Math.max(10, Math.round((count / maxDailyCount) * 100)) : 0,
    };
  });

  const approvedSubmissions = submissions.filter((submission) => submission.status === "approved");
  const co2Kg = approvedSubmissions.reduce((total, submission) => total + (co2KgByWasteType[wasteTypeFromAi(submission.ai_result)] ?? 0.12), 0);
  const binById = new Map(bins.map((bin) => [bin.id, bin]));
  const recentSubmissionWithBin = submissions.find((submission) => binById.has(submission.bin_id));
  const nearestBinLabel = recentSubmissionWithBin ? (binById.get(recentSubmissionWithBin.bin_id)?.location_name ?? "Chưa có") : "Chưa có";

  const uniqueProfiles = new Map(profiles.map((profile) => [profile.id, profile]));
  if (!uniqueProfiles.has(currentUserId) && currentPoints > 0) {
    uniqueProfiles.set(currentUserId, { id: currentUserId, points: currentPoints });
  }
  const rankedProfiles = [...uniqueProfiles.values()].filter((profile) => profile.points > 0);
  const totalRankedUsers = rankedProfiles.length;
  const rank = totalRankedUsers > 0 && currentPoints > 0 ? rankedProfiles.filter((profile) => profile.points > currentPoints).length + 1 : null;
  const percentile = rank ? Math.ceil((rank / totalRankedUsers) * 100) : null;

  return {
    weeklyTrend,
    approvedCount: approvedSubmissions.length,
    co2Label: formatKg(co2Kg),
    rankLabel: rank ? `#${rank.toLocaleString("vi-VN")}` : "Chưa có",
    percentileLabel: percentile ? `Top ${percentile.toLocaleString("vi-VN")}%` : "Chưa xếp hạng",
    nearestBinLabel,
  };
}
