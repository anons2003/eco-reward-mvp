import { beforeEach, describe, expect, it, vi } from "vitest";

const analyzeImage = vi.fn();

vi.mock("@/application/ai/analyze-image", () => ({
  analyzeImage,
}));

function postAnalyze(body: unknown) {
  return new Request("https://eco.test/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/analyze", () => {
  beforeEach(() => {
    analyzeImage.mockReset();
  });

  it("validates and analyzes a submission image URL", async () => {
    analyzeImage.mockResolvedValueOnce({
      wasteType: "paper",
      confidence: 0.88,
      objectCount: 1,
      imageQuality: "good",
      notes: "Ảnh hợp lệ.",
      provider: "openai",
    });
    const { POST } = await import("./route");

    const response = await POST(postAnalyze({ imageUrl: "https://cdn.example.com/image.jpg" }));

    expect(response.status).toBe(200);
    expect(analyzeImage).toHaveBeenCalledWith("https://cdn.example.com/image.jpg");
    await expect(response.json()).resolves.toEqual({
      result: {
        wasteType: "paper",
        confidence: 0.88,
        objectCount: 1,
        imageQuality: "good",
        notes: "Ảnh hợp lệ.",
        provider: "openai",
      },
    });
  });

  it("rejects invalid request bodies", async () => {
    const { POST } = await import("./route");

    const response = await POST(postAnalyze({ imageUrl: "" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "imageUrl là bắt buộc." });
    expect(analyzeImage).not.toHaveBeenCalled();
  });
});
