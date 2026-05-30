import type { AIResult, WasteType } from "@/core/entities/types";

const demoTypes: WasteType[] = ["plastic_bottle", "metal_can", "paper", "cardboard", "glass_bottle", "organic"];

function hashText(value: string): number {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

export async function mockAnalyzeImage(imageUrl: string): Promise<AIResult> {
  const lowerUrl = imageUrl.toLowerCase();

  if (lowerUrl.includes("plastic")) {
    return {
      wasteType: "plastic_bottle",
      confidence: 0.92,
      objectCount: 1,
      imageQuality: "good",
      notes: "Mock AI nhận diện chai nhựa rõ nét.",
    };
  }

  const index = hashText(imageUrl) % demoTypes.length;
  return {
    wasteType: demoTypes[index],
    confidence: 0.8 + (hashText(`${imageUrl}:confidence`) % 16) / 100,
    objectCount: 1,
    imageQuality: "good",
    notes: "Kết quả mock ổn định cho demo.",
  };
}
