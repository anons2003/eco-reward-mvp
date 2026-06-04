import type { Json } from "@/infrastructure/supabase/database.types";

export type ProfileMetricsSubmission = {
  id: string;
  ai_result: Json;
  status: string;
  points: number;
  created_at: string;
};

export type ProfileMetricsRedemption = {
  id: string;
  reward_item_id: string;
  points_spent: number;
  created_at: string;
};

export type ProfileMetricsReward = {
  id: string;
  category: string;
};

export type ProfileChartPoint = {
  label: string;
  approvedCount: number;
  height: number;
};

export type ProfileAchievement = {
  title: string;
  body: string;
  tone: "green" | "blue" | "amber";
  kind: "recycle" | "droplets" | "leaf";
};

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

const tierThresholds = [
  { name: "Bạc", min: 0, next: 500 },
  { name: "Vàng", min: 500, next: 1500 },
  { name: "Bạch kim", min: 1500, next: 5000 },
  { name: "Kim cương", min: 5000, next: null },
] as const;

function wasteTypeFromAi(value: Json) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "unknown";
  return typeof value.wasteType === "string" ? value.wasteType : "unknown";
}

function formatKg(value: number) {
  if (value <= 0) return "0";
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function lastSixMonthPoints(now: Date) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: monthKey(date),
      label: `T${date.getMonth() + 1}`,
    };
  });
}

function tierForPoints(points: number) {
  return [...tierThresholds].reverse().find((tier) => points >= tier.min) ?? tierThresholds[0];
}

export function buildProfileMetrics({
  now = new Date(),
  points,
  submissions,
  redemptions,
  rewards,
}: {
  now?: Date;
  points: number;
  submissions: ProfileMetricsSubmission[];
  redemptions: ProfileMetricsRedemption[];
  rewards: ProfileMetricsReward[];
}) {
  const approvedSubmissions = submissions.filter((submission) => submission.status === "approved");
  const pendingSubmissions = submissions.filter((submission) => submission.status === "pending_review");
  const rejectedSubmissions = submissions.filter((submission) => submission.status === "rejected");
  const co2Kg = approvedSubmissions.reduce((total, submission) => total + (co2KgByWasteType[wasteTypeFromAi(submission.ai_result)] ?? 0.12), 0);
  const rewardById = new Map(rewards.map((reward) => [reward.id, reward]));
  const contributionRedemptions = redemptions.filter((redemption) => rewardById.get(redemption.reward_item_id)?.category === "Đóng góp");

  const months = lastSixMonthPoints(now);
  const countsByMonth = new Map<string, number>();
  for (const submission of approvedSubmissions) {
    const date = new Date(submission.created_at);
    const key = monthKey(date);
    countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
  }
  const maxCount = Math.max(...months.map((month) => countsByMonth.get(month.key) ?? 0), 0);
  const chart: ProfileChartPoint[] = months.map((month) => {
    const approvedCount = countsByMonth.get(month.key) ?? 0;
    return {
      label: month.label,
      approvedCount,
      height: maxCount > 0 && approvedCount > 0 ? Math.max(12, Math.round((approvedCount / maxCount) * 100)) : 0,
    };
  });

  const achievements: ProfileAchievement[] = [
    approvedSubmissions.length >= 1
      ? { title: "Đã xác thực lượt đầu", body: `${approvedSubmissions.length.toLocaleString("vi-VN")} lượt phân loại đã hoàn thành`, kind: "recycle", tone: "green" }
      : null,
    co2Kg > 0 ? { title: "Dấu chân carbon thấp hơn", body: `Ước tính giảm ${formatKg(co2Kg)} kg CO2`, kind: "leaf", tone: "blue" } : null,
    contributionRedemptions.length > 0
      ? { title: "Đóng góp xanh", body: `${contributionRedemptions.length.toLocaleString("vi-VN")} lượt đổi nhóm Đóng góp`, kind: "droplets", tone: "amber" }
      : null,
  ].filter((achievement): achievement is ProfileAchievement => Boolean(achievement));

  const tier = tierForPoints(points);
  const nextRank = tier.next;
  const progress = nextRank ? Math.min(Math.round((points / nextRank) * 100), 100) : 100;

  return {
    tierName: tier.name,
    nextRank,
    progress,
    approvedCount: approvedSubmissions.length,
    pendingCount: pendingSubmissions.length,
    rejectedCount: rejectedSubmissions.length,
    contributionCount: contributionRedemptions.length,
    co2KgLabel: formatKg(co2Kg),
    chart,
    achievements,
  };
}
