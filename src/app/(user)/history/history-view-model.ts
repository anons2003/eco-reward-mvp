import type { Database, Json } from "@/infrastructure/supabase/database.types";

export type HistorySubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "bin_id" | "image_url" | "ai_result" | "status" | "points" | "reason" | "risk_flags" | "created_at">;
export type HistoryBinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "location_name">;
export type HistoryRedemptionRow = Pick<Database["public"]["Tables"]["reward_redemptions"]["Row"], "id" | "reward_item_id" | "points_spent" | "status" | "created_at">;

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
  };
  rows: HistoryActivity[];
};

function objectFromJson(value: Json) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function wasteLabel(value: Json) {
  const result = objectFromJson(value);
  const wasteType = typeof result.wasteType === "string" ? result.wasteType : typeof result.mode === "string" ? result.mode : "unknown";
  const labels: Record<string, string> = {
    manual_review: "Duyệt thủ công",
    plastic_bottle: "Chai nhựa",
    metal_can: "Lon kim loại",
    paper: "Giấy",
    cardboard: "Bìa carton",
    glass_bottle: "Chai thủy tinh",
    organic: "Hữu cơ",
    hazardous: "Nguy hại",
    unknown: "Chưa xác định",
  };
  return labels[wasteType] ?? wasteType.replaceAll("_", " ");
}

export function buildHistoryViewModel({
  submissions,
  bins,
  redemptions,
}: {
  submissions: HistorySubmissionRow[];
  bins: HistoryBinRow[];
  redemptions: HistoryRedemptionRow[];
}): HistoryViewModel {
  const binById = new Map(bins.map((bin) => [bin.id, bin]));
  const approved = submissions.filter((submission) => submission.status === "approved");
  const pending = submissions.filter((submission) => submission.status === "pending_review");
  const rejected = submissions.filter((submission) => submission.status === "rejected");

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
    title: `Đổi thưởng ${redemption.reward_item_id.slice(0, 8)}`,
    createdAt: redemption.created_at,
    pointsLabel: `-${redemption.points_spent} pts`,
    status: redemption.status,
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
    },
    rows: [...submissionRows, ...redemptionRows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };
}
