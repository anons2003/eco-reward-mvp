import type { AIResult, WasteType } from "@/core/entities/types";

const labels: Record<string, WasteType> = {
  plastic: "plastic_bottle",
  bottle: "plastic_bottle",
  can: "metal_can",
  paper: "paper",
  cardboard: "cardboard",
  glass: "glass_bottle",
  organic: "organic",
  hazardous: "hazardous",
};

export async function roboflowAnalyzeImage(imageUrl: string): Promise<AIResult> {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID;
  const apiUrl = process.env.ROBOFLOW_API_URL ?? "https://serverless.roboflow.com";

  if (!apiKey || !modelId) {
    throw new Error("Missing Roboflow configuration");
  }

  const response = await fetch(`${apiUrl}/${modelId}?api_key=${apiKey}&image=${encodeURIComponent(imageUrl)}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Roboflow request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    predictions?: Array<{ class?: string; confidence?: number }>;
  };
  const best = [...(payload.predictions ?? [])].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
  const normalized = best?.class?.toLowerCase() ?? "unknown";
  const wasteType = Object.entries(labels).find(([label]) => normalized.includes(label))?.[1] ?? "unknown";

  return {
    wasteType,
    confidence: best?.confidence ?? 0,
    objectCount: payload.predictions?.length ?? 0,
    imageQuality: best ? "good" : "unclear",
    notes: best ? `Roboflow class: ${best.class}` : "Không có prediction từ Roboflow.",
  };
}
