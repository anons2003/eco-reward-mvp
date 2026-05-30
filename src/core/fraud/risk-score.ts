import type { AIResult, SubmissionDecision, ValidationSignals } from "@/core/entities/types";
import { calculatePoints } from "@/core/points/calculate-points";

const MIN_AI_CONFIDENCE = Number(process.env.MIN_AI_CONFIDENCE ?? "0.75");

export function calculateSubmissionDecision(aiResult: AIResult, signals: ValidationSignals): SubmissionDecision {
  const riskFlags: string[] = [];

  if (!signals.qrValid) riskFlags.push("QR không hợp lệ");
  if (!signals.sessionValid) riskFlags.push("Phiên quét đã hết hạn");
  if (!signals.binActive) riskFlags.push("Thùng rác không hoạt động");
  if (signals.gpsWithinRadius === false) riskFlags.push("Vị trí nằm ngoài bán kính cho phép");
  if (signals.gpsWithinRadius === null) riskFlags.push("Thiếu tín hiệu vị trí");
  if (signals.dailyLimitReached) riskFlags.push("Người dùng đã vượt giới hạn gửi trong ngày");
  if (signals.duplicateImage) riskFlags.push("Ảnh có dấu hiệu bị gửi trùng");
  if (aiResult.confidence < MIN_AI_CONFIDENCE) riskFlags.push("AI chưa đủ tự tin");
  if (aiResult.imageQuality !== "good") riskFlags.push("Chất lượng ảnh chưa đạt");
  if (aiResult.objectCount > 3) riskFlags.push("Ảnh có quá nhiều vật thể");

  const hardReject =
    !signals.qrValid ||
    !signals.sessionValid ||
    !signals.binActive ||
    signals.dailyLimitReached ||
    signals.duplicateImage ||
    signals.gpsWithinRadius === false;

  if (hardReject) {
    return {
      status: "rejected",
      points: 0,
      reason: riskFlags[0] ?? "Lượt gửi không hợp lệ",
      riskFlags,
    };
  }

  const needsReview =
    signals.gpsWithinRadius === null ||
    aiResult.confidence < MIN_AI_CONFIDENCE ||
    aiResult.imageQuality !== "good" ||
    aiResult.objectCount > 3 ||
    aiResult.wasteType === "unknown" ||
    aiResult.wasteType === "hazardous";

  if (needsReview) {
    return {
      status: "pending_review",
      points: 0,
      reason: riskFlags[0] ?? "Cần admin kiểm duyệt",
      riskFlags,
    };
  }

  return {
    status: "approved",
    points: calculatePoints(aiResult.wasteType),
    reason: "Lượt gửi hợp lệ và được cộng điểm tự động",
    riskFlags,
  };
}
