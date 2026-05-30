import type { AuditLog, Bin, PointTransaction, Profile, RewardItem, Submission } from "@/core/entities/types";

export type ScanSessionResult =
  | { ok: true; session: import("@/core/entities/types").ScanSession; bin: Bin }
  | { ok: false; error: string };

export type ReviewSubmissionResult = { ok: true; submission: Submission } | { ok: false; error: string };

export type DashboardStats = {
  totalSubmissions: number;
  approved: number;
  pending: number;
  rejected: number;
  pointsIssued: number;
};

export type EcoRewardRepository = {
  getDashboardStats(): DashboardStats;
  getDemoUser(role?: "user" | "admin"): Profile;
  getProfile(idValue: string): Profile;
  getSubmission(submissionId: string): Submission | null;
  listAuditLogs(): AuditLog[];
  listBins(): Bin[];
  listPointTransactions(userId: string): PointTransaction[];
  listRewards(): RewardItem[];
  listSubmissions(status?: string | null): Submission[];
  listUserSubmissions(userId: string): Submission[];
  createScanSession(input: { qrCode: string; lat?: number | null; lng?: number | null; userId?: string }): ScanSessionResult;
  createSubmission(input: { scanSessionId: string; imageUrl: string; userId?: string }): Promise<Submission>;
  reviewSubmission(input: { submissionId: string; decision: "approved" | "rejected"; reason: string; actorId?: string }): ReviewSubmissionResult;
};
