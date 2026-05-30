import type { AIResult } from "@/core/entities/types";
import { mockAnalyzeImage } from "@/infrastructure/ai/mock-provider";
import { roboflowAnalyzeImage } from "@/infrastructure/ai/roboflow-provider";

export async function analyzeImage(imageUrl: string): Promise<AIResult> {
  if (process.env.AI_PROVIDER === "roboflow") {
    return roboflowAnalyzeImage(imageUrl);
  }

  return mockAnalyzeImage(imageUrl);
}
