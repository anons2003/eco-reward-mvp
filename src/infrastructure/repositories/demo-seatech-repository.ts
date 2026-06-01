import { env } from "@/infrastructure/config/env";
import type { AuditLog, Bin, PointTransaction, Profile, RewardItem, ScanSession, Submission } from "@/core/entities/types";
import { analyzeImage } from "@/application/ai/analyze-image";
import { calculateSubmissionDecision } from "@/core/fraud/risk-score";
import type { SeaTechRepository } from "@/application/repositories/seatech-repository";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

type DemoSeaTechStore = {
  profiles: Profile[];
  bins: Bin[];
  scanSessions: ScanSession[];
  submissions: Submission[];
  pointTransactions: PointTransaction[];
  rewardItems: RewardItem[];
  auditLogs: AuditLog[];
};

declare global {
  var __seaTechDemoStore: DemoSeaTechStore | undefined;
}

const initialProfiles: Profile[] = [
  {
    id: "demo-user",
    email: "user@example.com",
    fullName: "Nguyen An",
    role: "user",
    points: 148,
    trustScore: 92,
  },
  {
    id: "demo-admin",
    email: "admin@example.com",
    fullName: "Admin SeaTech",
    role: "admin",
    points: 0,
    trustScore: 100,
  },
];

const initialBins: Bin[] = [
  {
    id: "bin-001",
    name: "Thùng rác thông minh A1",
    qrCode: "ECO-BIN-A1",
    locationName: "Sảnh chính tòa nhà A",
    lat: 10.7769,
    lng: 106.7009,
    active: true,
  },
  {
    id: "bin-002",
    name: "Thùng rác thông minh B2",
    qrCode: "ECO-BIN-B2",
    locationName: "Khu cafeteria",
    lat: 10.7772,
    lng: 106.7012,
    active: true,
  },
  {
    id: "bin-003",
    name: "Thùng bảo trì C3",
    qrCode: "ECO-BIN-C3",
    locationName: "Bãi xe tầng hầm",
    lat: 10.7758,
    lng: 106.6998,
    active: false,
  },
];

const initialScanSessions: ScanSession[] = [];
const initialSubmissions: Submission[] = [
  {
    id: "sub-demo-001",
    userId: "demo-user",
    binId: "bin-001",
    scanSessionId: "scan-seed-001",
    imageUrl: "/demo/plastic-bottle.svg",
    aiResult: { wasteType: "plastic_bottle", confidence: 0.93, objectCount: 1, imageQuality: "good" },
    status: "approved",
    points: 10,
    reason: "Lượt gửi hợp lệ và được cộng điểm tự động",
    riskFlags: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "sub-demo-002",
    userId: "demo-user",
    binId: "bin-002",
    scanSessionId: "scan-seed-002",
    imageUrl: "/demo/paper.svg",
    aiResult: { wasteType: "paper", confidence: 0.58, objectCount: 1, imageQuality: "good" },
    status: "pending_review",
    points: 0,
    reason: "AI chưa đủ tự tin",
    riskFlags: ["AI chưa đủ tự tin"],
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
];

const initialPointTransactions: PointTransaction[] = [
  {
    id: "pt-demo-001",
    userId: "demo-user",
    submissionId: "sub-demo-001",
    points: 10,
    reason: "Chai nhựa tại thùng A1",
    createdAt: initialSubmissions[0].createdAt,
  },
];

const initialRewardItems: RewardItem[] = [
  {
    id: "reward-001",
    title: "Voucher cà phê xanh",
    description: "Đổi 120 điểm lấy một voucher đồ uống tại quầy cafeteria.",
    pointsRequired: 120,
    stock: 24,
  },
  {
    id: "reward-002",
    title: "Góp cây cho khuôn viên",
    description: "Đóng góp 80 điểm vào quỹ cây xanh của chiến dịch.",
    pointsRequired: 80,
    stock: 99,
  },
];

const initialAuditLogs: AuditLog[] = [];

const store =
  globalThis.__seaTechDemoStore ??
  (globalThis.__seaTechDemoStore = {
    profiles: initialProfiles,
    bins: initialBins,
    scanSessions: initialScanSessions,
    submissions: initialSubmissions,
    pointTransactions: initialPointTransactions,
    rewardItems: initialRewardItems,
    auditLogs: initialAuditLogs,
  });

const { profiles, bins, scanSessions, submissions, pointTransactions, rewardItems, auditLogs } = store;

export function getDemoUser(role: "user" | "admin" = "user") {
  return profiles.find((profile) => profile.role === role) ?? profiles[0];
}

export function getProfile(idValue: string) {
  return profiles.find((profile) => profile.id === idValue) ?? profiles[0];
}

export function listBins() {
  return [...bins];
}

export function listRewards() {
  return [...rewardItems];
}

export function listSubmissions(status?: string | null) {
  const rows = status ? submissions.filter((submission) => submission.status === status) : submissions;
  return [...rows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getSubmission(submissionId: string) {
  return submissions.find((submission) => submission.id === submissionId) ?? null;
}

export function listUserSubmissions(userId: string) {
  return listSubmissions().filter((submission) => submission.userId === userId);
}

export function listPointTransactions(userId: string) {
  return pointTransactions.filter((transaction) => transaction.userId === userId).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getDashboardStats() {
  return {
    totalSubmissions: submissions.length,
    approved: submissions.filter((submission) => submission.status === "approved").length,
    pending: submissions.filter((submission) => submission.status === "pending_review").length,
    rejected: submissions.filter((submission) => submission.status === "rejected").length,
    pointsIssued: pointTransactions.reduce((total, transaction) => total + transaction.points, 0),
  };
}

export function createScanSession(input: { qrCode: string; lat?: number | null; lng?: number | null; userId?: string }) {
  const bin = bins.find((row) => row.qrCode === input.qrCode);
  if (!bin) {
    return { ok: false as const, error: "QR không tồn tại trong hệ thống." };
  }

  if (!bin.active) {
    return { ok: false as const, error: "Thùng rác đang bảo trì." };
  }

  const session: ScanSession = {
    id: id("scan"),
    userId: input.userId ?? "demo-user",
    binId: bin.id,
    qrCode: input.qrCode,
    createdAt: now(),
    expiresAt: new Date(Date.now() + env.qrSessionTtlSeconds * 1000).toISOString(),
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  };
  scanSessions.push(session);

  return { ok: true as const, session, bin };
}

function getTodaySubmissionCount(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return submissions.filter((submission) => submission.userId === userId && Date.parse(submission.createdAt) >= start.getTime()).length;
}

export async function createSubmission(input: { scanSessionId: string; imageUrl: string; userId?: string }) {
  const session = scanSessions.find((row) => row.id === input.scanSessionId);
  const bin = session ? bins.find((row) => row.id === session.binId) : null;
  const userId = input.userId ?? session?.userId ?? "demo-user";
  const aiResult = await analyzeImage(input.imageUrl);
  const decision = calculateSubmissionDecision(aiResult, {
    qrValid: Boolean(session),
    sessionValid: Boolean(session && Date.parse(session.expiresAt) > Date.now()),
    binActive: Boolean(bin?.active),
    gpsWithinRadius: session?.lat && session.lng ? true : null,
    dailyLimitReached: getTodaySubmissionCount(userId) >= env.maxSubmissionsPerUserPerDay,
    duplicateImage: submissions.some((submission) => submission.imageUrl === input.imageUrl),
  });

  const submission: Submission = {
    id: id("sub"),
    userId,
    binId: bin?.id ?? "unknown-bin",
    scanSessionId: input.scanSessionId,
    imageUrl: input.imageUrl,
    aiResult,
    status: decision.status,
    points: decision.points,
    reason: decision.reason,
    riskFlags: decision.riskFlags,
    createdAt: now(),
  };
  submissions.unshift(submission);

  if (decision.status === "approved" && decision.points > 0) {
    addPoints(userId, submission.id, decision.points, decision.reason);
  }

  return submission;
}

function addPoints(userId: string, submissionId: string, points: number, reason: string) {
  const profile = profiles.find((row) => row.id === userId);
  if (profile) profile.points += points;
  pointTransactions.unshift({
    id: id("pt"),
    userId,
    submissionId,
    points,
    reason,
    createdAt: now(),
  });
}

export function reviewSubmission(input: { submissionId: string; decision: "approved" | "rejected"; reason: string; actorId?: string }) {
  const submission = getSubmission(input.submissionId);
  if (!submission) {
    return { ok: false as const, error: "Không tìm thấy lượt gửi." };
  }

  const previousStatus = submission.status;
  submission.status = input.decision;
  submission.reason = input.reason;
  submission.reviewedAt = now();
  submission.reviewedBy = input.actorId ?? "demo-admin";

  if (input.decision === "approved" && previousStatus !== "approved") {
    const points = submission.points || 5;
    submission.points = points;
    addPoints(submission.userId, submission.id, points, input.reason);
  }

  auditLogs.unshift({
    id: id("audit"),
    actorId: input.actorId ?? "demo-admin",
    action: `submission.${input.decision}`,
    targetId: submission.id,
    metadata: { reason: input.reason, previousStatus },
    createdAt: now(),
  });

  return { ok: true as const, submission };
}

export function listAuditLogs() {
  return [...auditLogs];
}

export const demoSeaTechRepository = {
  getDashboardStats,
  getDemoUser,
  getProfile,
  getSubmission,
  listAuditLogs,
  listBins,
  listPointTransactions,
  listRewards,
  listSubmissions,
  listUserSubmissions,
  createScanSession,
  createSubmission,
  reviewSubmission,
} satisfies SeaTechRepository;
