import { afterEach, describe, expect, it, vi } from "vitest";
import { openaiAnalyzeImage } from "./openai-provider";
import { wasteReviewJsonSchema } from "./waste-review-schema";

describe("openaiAnalyzeImage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("limits AI classification to MVP review categories", () => {
    expect(wasteReviewJsonSchema.properties.wasteType.enum).toEqual(["plastic_bottle", "metal_can", "paper", "glass_bottle", "unknown"]);
    expect(wasteReviewJsonSchema.properties.wasteType.enum).not.toContain("organic");
    expect(wasteReviewJsonSchema.properties.wasteType.enum).not.toContain("hazardous");
    expect(wasteReviewJsonSchema.properties.wasteType.enum).not.toContain("cardboard");
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

  it("instructs the model to classify packaging material instead of product contents", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
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
                    confidence: 0.91,
                    objectCount: 1,
                    imageQuality: "good",
                    contaminationRisk: "medium",
                    visibleEvidence: ["Plastic sauce bottle"],
                    fraudFlags: [],
                    notes: "Phân loại theo bao bì nhựa, không theo thực phẩm bên trong.",
                  }),
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await openaiAnalyzeImage("https://cdn.example.com/chinsu-bottle.jpg");

    const requestBody = JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[0]?.[1]?.body));
    const prompt = requestBody.input[0].content[0].text;

    expect(prompt).toContain("Ưu tiên vật liệu bao bì");
    expect(prompt).toContain("chai nhựa đựng tương");
    expect(prompt).toContain("plastic_bottle");
    expect(prompt).toContain("Mọi vật liệu khác phải trả unknown");
  });

  it("instructs the model to reject photos of bins or sorting stations without a waste item", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    isValidSubmission: false,
                    wasteType: "unknown",
                    confidence: 0.22,
                    objectCount: 0,
                    imageQuality: "good",
                    contaminationRisk: "low",
                    visibleEvidence: ["Photo shows a sorting station model", "No separate waste item is visible"],
                    fraudFlags: ["bin_or_station_photo", "no_visible_waste"],
                    notes: "Ảnh chụp thùng/mô hình phân loại, chưa thấy vật phẩm rác riêng để chấm điểm.",
                  }),
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await openaiAnalyzeImage("https://cdn.example.com/sorting-station.jpg");

    const requestBody = JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[0]?.[1]?.body));
    const prompt = requestBody.input[0].content[0].text;

    expect(prompt).toContain("Ảnh chụp thùng rác");
    expect(prompt).toContain("mô hình phân loại");
    expect(prompt).toContain("không được phân loại là cardboard");
  });

  it("fails closed when OpenAI key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(openaiAnalyzeImage("https://cdn.example.com/submission.jpg")).rejects.toThrow("Missing OPENAI_API_KEY");
  });
});
