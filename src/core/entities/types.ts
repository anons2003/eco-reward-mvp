export type UserRole = "user" | "admin";

export type WasteType =
  | "plastic_bottle"
  | "metal_can"
  | "paper"
  | "cardboard"
  | "glass_bottle"
  | "organic"
  | "hazardous"
  | "unknown";

export type SubmissionStatus = "approved" | "pending_review" | "rejected";

export type ImageQuality = "good" | "blurry" | "dark" | "unclear";

export type ContaminationRisk = "low" | "medium" | "high";

export type AIResult = {
  wasteType: WasteType;
  confidence: number;
  objectCount: number;
  imageQuality: ImageQuality;
  notes?: string;
  isValidSubmission?: boolean;
  contaminationRisk?: ContaminationRisk;
  visibleEvidence?: string[];
  fraudFlags?: string[];
  provider?: string;
  model?: string;
};

export type ValidationSignals = {
  qrValid: boolean;
  sessionValid: boolean;
  binActive: boolean;
  gpsWithinRadius: boolean | null;
  dailyLimitReached: boolean;
  duplicateImage: boolean;
};

export type SubmissionDecision = {
  status: SubmissionStatus;
  points: number;
  reason: string;
  riskFlags: string[];
};

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  points: number;
  trustScore: number;
};

export type Bin = {
  id: string;
  name: string;
  qrCode: string;
  locationName: string;
  lat: number;
  lng: number;
  active: boolean;
};

export type ScanSession = {
  id: string;
  userId: string;
  binId: string;
  qrCode: string;
  expiresAt: string;
  createdAt: string;
  lat: number | null;
  lng: number | null;
};

export type Submission = {
  id: string;
  userId: string;
  binId: string;
  scanSessionId: string;
  imageUrl: string;
  aiResult: AIResult;
  status: SubmissionStatus;
  points: number;
  reason: string;
  riskFlags: string[];
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

export type PointTransaction = {
  id: string;
  userId: string;
  submissionId: string;
  points: number;
  reason: string;
  createdAt: string;
};

export type PointRule = {
  wasteType: WasteType;
  points: number;
  active: boolean;
  updatedAt: string;
};

export type RewardItem = {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  stock: number;
};

export type AuditLog = {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
