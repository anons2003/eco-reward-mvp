import type { Database, Json } from "@/infrastructure/supabase/database.types";

export type FraudProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "phone" | "location" | "bio" | "role" | "status" | "trust_score">;
export type FraudSubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "user_id" | "bin_id" | "ai_result" | "status" | "reason" | "risk_flags" | "created_at">;

export type FraudRisk = "high" | "medium" | "low";
export type FraudCategory = "location" | "duplicate" | "spam" | "other";

export type FraudAlertRow = {
  category: FraudCategory;
  date: string;
  detail: string;
  handle: string;
  id: string;
  issue: string;
  name: string;
  risk: FraudRisk;
  time: string;
  user: FraudProfileRow | null;
  userId: string;
};

type JsonRecord = Record<string, Json | undefined>;

const riskLabel: Record<FraudRisk, string> = {
  high: "Cao",
  low: "Thấp",
  medium: "Trung bình",
};

function aiResultObject(value: Json): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function riskCategory(flag: string): FraudCategory {
  const normalized = flag.toLowerCase();
  if (normalized.includes("location") || normalized.includes("gps") || normalized.includes("distance") || normalized.includes("radius")) return "location";
  if (normalized.includes("duplicate") || normalized.includes("image") || normalized.includes("hash") || normalized.includes("trùng")) return "duplicate";
  if (normalized.includes("spam") || normalized.includes("rate") || normalized.includes("frequency") || normalized.includes("too_many")) return "spam";
  return "other";
}

function submissionRisk(submission: FraudSubmissionRow): FraudRisk {
  const flags = submission.risk_flags.map((flag) => flag.toLowerCase());
  if (submission.status === "rejected" || flags.some((flag) => flag.includes("high") || flag.includes("fraud") || flag.includes("location") || flag.includes("duplicate"))) return "high";
  if (flags.some((flag) => flag.includes("medium") || flag.includes("low_confidence") || flag.includes("manual"))) return "medium";
  return "low";
}

function flagIssue(flag: string) {
  const category = riskCategory(flag);
  if (category === "location") return "Vị trí quét bất thường";
  if (category === "duplicate") return "Dấu hiệu ảnh hoặc lượt gửi trùng";
  if (category === "spam") return "Tần suất gửi bất thường";
  return "Lượt gửi cần rà soát";
}

function alertDetail(submission: FraudSubmissionRow, flag: string) {
  const result = aiResultObject(submission.ai_result);
  const confidence = typeof result.confidence === "number" ? Math.round(result.confidence * 100) : null;
  const wasteType = typeof result.wasteType === "string" ? result.wasteType.replaceAll("_", " ") : "chưa xác định";
  const reason = submission.reason.trim();
  const parts = [`Flag: ${flag}`, `Loại rác: ${wasteType}`];
  if (confidence !== null) parts.push(`Tin cậy: ${confidence}%`);
  if (reason) parts.push(reason);
  return parts.join(" · ");
}

function formatDate(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" }).format(date),
    time: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date),
  };
}

function profileHandle(profile: FraudProfileRow | undefined, userId: string) {
  if (profile?.email) return profile.email.split("@")[0] ?? profile.email;
  return userId.slice(0, 8);
}

export function buildFraudAlertsViewModel({
  profiles,
  riskFilter = "all",
  submissions,
}: {
  profiles: FraudProfileRow[];
  riskFilter?: FraudRisk | "all";
  submissions: FraudSubmissionRow[];
}) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const riskySubmissions = submissions.filter((submission) => submission.risk_flags.length > 0 || submission.status === "rejected");
  const alerts = riskySubmissions.map((submission): FraudAlertRow => {
    const primaryFlag = submission.risk_flags[0] ?? (submission.status === "rejected" ? "rejected_submission" : "review_required");
    const profile = profileById.get(submission.user_id);
    const formatted = formatDate(submission.created_at);
    return {
      category: riskCategory(primaryFlag),
      date: formatted.date,
      detail: alertDetail(submission, primaryFlag),
      handle: profileHandle(profile, submission.user_id),
      id: submission.id,
      issue: flagIssue(primaryFlag),
      name: profile?.full_name || profile?.email || `Người dùng ${submission.user_id.slice(0, 8)}`,
      risk: submissionRisk(submission),
      time: formatted.time,
      user: profile ?? null,
      userId: submission.user_id,
    };
  });

  const filteredAlerts = riskFilter === "all" ? alerts : alerts.filter((alert) => alert.risk === riskFilter);
  const categoryCounts = alerts.reduce(
    (counts, alert) => ({ ...counts, [alert.category]: counts[alert.category] + 1 }),
    { duplicate: 0, location: 0, other: 0, spam: 0 } satisfies Record<FraudCategory, number>,
  );
  const riskCounts = alerts.reduce(
    (counts, alert) => ({ ...counts, [alert.risk]: counts[alert.risk] + 1 }),
    { high: 0, low: 0, medium: 0 } satisfies Record<FraudRisk, number>,
  );

  return {
    alerts: filteredAlerts,
    categoryCounts,
    metrics: {
      duplicate: categoryCounts.duplicate,
      location: categoryCounts.location,
      newAlerts: alerts.length,
      spam: categoryCounts.spam,
    },
    riskCounts,
    riskLabel,
    totalAlerts: alerts.length,
  };
}
