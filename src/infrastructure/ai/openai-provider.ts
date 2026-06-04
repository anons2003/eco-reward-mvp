import type { AIResult } from "@/core/entities/types";
import { normalizeWasteReviewResult, wasteReviewJsonSchema } from "./waste-review-schema";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_TIMEOUT_MS = 20_000;

function readOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return apiKey;
}

function readModel() {
  return process.env.AI_REVIEW_MODEL?.trim() || DEFAULT_MODEL;
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text;

  const output = Array.isArray(record.output) ? record.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;

    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;

      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.refusal === "string") {
        throw new Error("OpenAI refused image analysis");
      }
      if (typeof partRecord.text === "string") {
        return partRecord.text;
      }
    }
  }

  return "";
}

export async function openaiAnalyzeImage(imageUrl: string): Promise<AIResult> {
  const apiKey = readOpenAIKey();
  const model = readModel();
  const timeoutMs = Number(process.env.AI_REVIEW_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Bạn là hệ thống kiểm duyệt ảnh rác tái chế của SeaTech. " +
                  "Nhiệm vụ MVP là chỉ phân loại 4 nhóm được auto-duyệt: plastic_bottle, metal_can, paper, glass_bottle. Mọi vật liệu khác phải trả unknown để admin duyệt thủ công. " +
                  "Ưu tiên vật liệu bao bì hơn nội dung/sản phẩm ghi trên nhãn. " +
                  "Ví dụ chai nhựa đựng tương, nước ngọt, dầu gội hoặc nước rửa phải phân loại là plastic_bottle nếu vật thể chính là chai nhựa. " +
                  "Carton, rác ướt/hữu cơ, pin, hóa chất, đồ điện tử, vải, nhựa không phải chai, hoặc vật không thuộc 4 nhóm chính phải trả unknown. " +
                  "Ảnh chụp thùng rác, mô hình phân loại, trạm phân loại, poster, bảng hướng dẫn hoặc thiết bị chứa rác không phải là lượt gửi rác hợp lệ; " +
                  "trường hợp đó không được phân loại là cardboard/plastic/metal theo vật liệu của thùng, mà phải trả wasteType unknown, objectCount 0, isValidSubmission false và thêm fraudFlags bin_or_station_photo, no_visible_waste. " +
                  "Phân loại vật thể chính trong ảnh, đánh giá chất lượng ảnh, rủi ro gian lận, và chỉ trả về JSON đúng schema. " +
                  "Nếu không chắc hoặc ảnh không thấy rác rõ ràng, dùng wasteType unknown, confidence thấp, isValidSubmission false.",
              },
              {
                type: "input_image",
                image_url: imageUrl,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "seatech_waste_review",
            strict: true,
            schema: wasteReviewJsonSchema,
          },
        },
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}`);
    }

    const outputText = extractOutputText(payload);
    if (!outputText) {
      throw new Error("OpenAI response did not include structured output");
    }

    return normalizeWasteReviewResult(JSON.parse(outputText), { provider: "openai", model });
  } finally {
    clearTimeout(timeout);
  }
}
