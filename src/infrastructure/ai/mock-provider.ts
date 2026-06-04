import type { AIResult, WasteType } from "@/core/entities/types";

const demoTypes: WasteType[] = ["plastic", "metal", "paper", "glass", "unknown"];

function hashText(value: string): number {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

export async function mockAnalyzeImage(imageUrl: string): Promise<AIResult> {
  const lowerUrl = imageUrl.toLowerCase();

  if (lowerUrl.includes("plastic")) {
    return {
      wasteType: "plastic",
      confidence: 0.92,
      objectCount: 1,
      imageQuality: "good",
      notes: "Mock AI nhận diện vật liệu nhựa rõ nét.",
    };
  }

  const index = hashText(imageUrl) % demoTypes.length;
  return {
    wasteType: demoTypes[index],
    confidence: demoTypes[index] === "unknown" ? 0.45 : 0.8 + (hashText(`${imageUrl}:confidence`) % 16) / 100,
    objectCount: demoTypes[index] === "unknown" ? 0 : 1,
    imageQuality: "good",
    isValidSubmission: demoTypes[index] !== "unknown",
    contaminationRisk: "low",
    visibleEvidence: demoTypes[index] === "unknown" ? [] : ["Mock MVP item"],
    fraudFlags: demoTypes[index] === "unknown" ? ["manual_review"] : [],
    notes: demoTypes[index] === "unknown" ? "Mock AI chuyển admin duyệt thủ công." : "Kết quả mock ổn định cho demo MVP.",
  };
}
