import type { AIResult } from "@/core/entities/types";
import { mockAnalyzeImage } from "@/infrastructure/ai/mock-provider";
import { openaiAnalyzeImage } from "@/infrastructure/ai/openai-provider";

function manualReviewFallback(notes: string): AIResult {
  return {
    wasteType: "unknown",
    confidence: 0,
    objectCount: 0,
    imageQuality: "unclear",
    notes,
    isValidSubmission: false,
    contaminationRisk: "medium",
    visibleEvidence: [],
    fraudFlags: ["manual_review"],
    provider: "manual",
  };
}

export async function analyzeImage(imageUrl: string): Promise<AIResult> {
  if (process.env.AI_REVIEW_ENABLED === "false") {
    return manualReviewFallback("AI review đang tắt, chuyển admin kiểm duyệt thủ công.");
  }

  const provider = process.env.AI_PROVIDER ?? "mock";

  if (provider === "openai") {
    try {
      return await openaiAnalyzeImage(imageUrl);
    } catch {
      return manualReviewFallback("AI tạm thời không khả dụng, chuyển admin kiểm duyệt thủ công.");
    }
  }

  if (provider === "mock") {
    return mockAnalyzeImage(imageUrl);
  }

  return manualReviewFallback("AI provider không được hỗ trợ, chuyển admin kiểm duyệt thủ công.");
}
