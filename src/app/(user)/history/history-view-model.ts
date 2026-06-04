import type { Database, Json } from "@/infrastructure/supabase/database.types";

export type HistorySubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "bin_id" | "image_url" | "ai_result" | "status" | "points" | "reason" | "risk_flags" | "created_at">;
export type HistoryBinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "location_name">;
export type HistoryRedemptionRow = Pick<Database["public"]["Tables"]["reward_redemptions"]["Row"], "id" | "reward_item_id" | "points_spent" | "status" | "redemption_code" | "created_at">;
export type HistoryRewardRow = Pick<Database["public"]["Tables"]["reward_items"]["Row"], "id" | "title">;

export type SubmissionHistoryActivity = {
  kind: "submission";
  id: string;
  href: string;
  title: string;
  createdAt: string;
  pointsLabel: string;
  imageUrl: string;
  status: HistorySubmissionRow["status"];
  reason: string;
  binName: string;
  binLocation: string;
};

export type RedemptionHistoryActivity = {
  kind: "redemption";
  id: string;
  title: string;
  createdAt: string;
  pointsLabel: string;
  status: string;
  redemptionCode: string;
};

export type HistoryActivity = SubmissionHistoryActivity | RedemptionHistoryActivity;

export type HistoryViewModel = {
  summary: {
    totalSubmissions: number;
    approvedSubmissions: number;
    pendingSubmissions: number;
    rejectedSubmissions: number;
    pointsEarned: number;
    pendingPoints: number;
    pointsSpent: number;
    redemptionCount: number;
    co2Kg: number;
    co2Label: string;
  };
  rows: HistoryActivity[];
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

function objectFromJson(value: Json) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function wasteLabel(value: Json) {
  const result = objectFromJson(value);
  const wasteType = wasteTypeFromAi(value);
  const labels: Record<string, string> = {
    manual_review: "Duyệt thủ công",
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

function wasteTypeFromAi(value: Json) {
  const result = objectFromJson(value);
  return typeof result.wasteType === "string" ? result.wasteType : typeof result.mode === "string" ? result.mode : "unknown";
}

function formatKg(value: number) {
  if (value <= 0) return "0 kg";
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} kg`;
}

export function buildHistoryViewModel({
  submissions,
  bins,
  redemptions,
  rewards = [],
}: {
  submissions: HistorySubmissionRow[];
  bins: HistoryBinRow[];
  redemptions: HistoryRedemptionRow[];
  rewards?: HistoryRewardRow[];
}): HistoryViewModel {
  const binById = new Map(bins.map((bin) => [bin.id, bin]));
  const rewardById = new Map(rewards.map((reward) => [reward.id, reward]));
  const approved = submissions.filter((submission) => submission.status === "approved");
  const pending = submissions.filter((submission) => submission.status === "pending_review");
  const rejected = submissions.filter((submission) => submission.status === "rejected");
  const co2Kg = approved.reduce((total, submission) => total + (co2KgByWasteType[wasteTypeFromAi(submission.ai_result)] ?? 0.12), 0);

  const submissionRows: SubmissionHistoryActivity[] = submissions.map((submission) => {
    const bin = binById.get(submission.bin_id);
    return {
      kind: "submission",
      id: submission.id,
      href: `/result/${submission.id}`,
      title: `Phân loại ${wasteLabel(submission.ai_result)}`,
      createdAt: submission.created_at,
      pointsLabel: submission.points > 0 ? `+${submission.points} pts` : "0 pts",
      imageUrl: submission.image_url,
      status: submission.status,
      reason: submission.reason,
      binName: bin?.name ?? `Bin ${submission.bin_id.slice(0, 8)}`,
      binLocation: bin?.location_name ?? "Chưa có vị trí",
    };
  });

  const redemptionRows: RedemptionHistoryActivity[] = redemptions.map((redemption) => ({
    kind: "redemption",
    id: redemption.id,
    title: rewardById.get(redemption.reward_item_id)?.title ?? `Ưu đãi ${redemption.reward_item_id.slice(0, 8)}`,
    createdAt: redemption.created_at,
    pointsLabel: `-${redemption.points_spent} pts`,
    status: redemption.status,
    redemptionCode: redemption.redemption_code,
  }));

  return {
    summary: {
      totalSubmissions: submissions.length,
      approvedSubmissions: approved.length,
      pendingSubmissions: pending.length,
      rejectedSubmissions: rejected.length,
      pointsEarned: approved.reduce((total, submission) => total + submission.points, 0),
      pendingPoints: pending.reduce((total, submission) => total + submission.points, 0),
      pointsSpent: redemptions.reduce((total, redemption) => total + redemption.points_spent, 0),
      redemptionCount: redemptions.length,
      co2Kg,
      co2Label: formatKg(co2Kg),
    },
    rows: [...submissionRows, ...redemptionRows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };
}
