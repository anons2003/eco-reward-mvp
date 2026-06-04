import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeImage } from "./analyze-image";
import { mockAnalyzeImage } from "@/infrastructure/ai/mock-provider";
import { openaiAnalyzeImage } from "@/infrastructure/ai/openai-provider";

vi.mock("@/infrastructure/ai/mock-provider", () => ({
  mockAnalyzeImage: vi.fn(async () => ({
    wasteType: "plastic",
    confidence: 0.9,
    objectCount: 1,
    imageQuality: "good",
    notes: "mock",
  })),
}));

vi.mock("@/infrastructure/ai/openai-provider", () => ({
  openaiAnalyzeImage: vi.fn(async () => ({
    wasteType: "glass",
    confidence: 0.91,
    objectCount: 1,
    imageQuality: "good",
    notes: "openai",
  })),
}));

describe("analyzeImage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("uses mock provider only when AI_PROVIDER is mock", async () => {
    vi.stubEnv("AI_PROVIDER", "mock");

    const result = await analyzeImage("data:image/jpeg;base64,abc");

    expect(result.wasteType).toBe("plastic");
    expect(mockAnalyzeImage).toHaveBeenCalledWith("data:image/jpeg;base64,abc");
    expect(openaiAnalyzeImage).not.toHaveBeenCalled();
  });

  it("sends unsupported providers to manual review instead of falling back to old taxonomies", async () => {
    vi.stubEnv("AI_PROVIDER", "roboflow");

    const result = await analyzeImage("data:image/jpeg;base64,abc");

    expect(result).toMatchObject({
      wasteType: "unknown",
      confidence: 0,
      objectCount: 0,
      provider: "manual",
      fraudFlags: ["manual_review"],
    });
    expect(mockAnalyzeImage).not.toHaveBeenCalled();
    expect(openaiAnalyzeImage).not.toHaveBeenCalled();
  });
});
