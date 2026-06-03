import { afterEach, describe, expect, it, vi } from "vitest";
import { openaiAnalyzeImage } from "./openai-provider";

describe("openaiAnalyzeImage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("parses structured waste review output from OpenAI Responses", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("AI_REVIEW_MODEL", "gpt-4.1-mini");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    isValidSubmission: true,
                    wasteType: "plastic_bottle",
                    confidence: 0.94,
                    objectCount: 1,
                    imageQuality: "good",
                    contaminationRisk: "low",
                    visibleEvidence: ["Clear bottle shape", "Plastic cap"],
                    fraudFlags: [],
                    notes: "Ảnh đủ rõ để admin duyệt nhanh.",
                  }),
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await openaiAnalyzeImage("https://cdn.example.com/submission.jpg");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
    expect(result).toMatchObject({
      provider: "openai",
      model: "gpt-4.1-mini",
      wasteType: "plastic_bottle",
      confidence: 0.94,
      imageQuality: "good",
      isValidSubmission: true,
      contaminationRisk: "low",
    });
  });

  it("fails closed when OpenAI key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(openaiAnalyzeImage("https://cdn.example.com/submission.jpg")).rejects.toThrow("Missing OPENAI_API_KEY");
  });
});
