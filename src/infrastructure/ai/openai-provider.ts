import type { AIResult } from "@/core/entities/types";
import { normalizeWasteReviewResult, wasteReviewJsonSchema } from "./waste-review-schema";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_TIMEOUT_MS = 20_000;
const WASTE_REVIEW_INSTRUCTIONS =
  "Bạn là hệ thống kiểm duyệt ảnh rác tái chế của SeaTech tại Việt Nam. " +
  "Nhiệm vụ MVP là chỉ phân loại 4 nhóm vật liệu được auto-duyệt: plastic (Nhựa), metal (Kim loại), paper (Giấy), glass (Thủy tinh). Mọi vật liệu khác phải trả unknown để admin duyệt thủ công. " +
  "Luôn ưu tiên vật liệu bao bì/vật thể chính hơn nội dung/sản phẩm ghi trên nhãn. Chỉ auto-duyệt khi ảnh thấy rõ một vật phẩm rác thật, sạch tương đối, không bị che khuất và thuộc đúng 4 nhóm MVP. " +
  "plastic là nhóm Nhựa, gồm chai PET/HDPE và đồ nhựa sinh hoạt sạch/khô: chai nước suối, nước ngọt, trà đóng chai, sữa uống chai nhựa, chai dầu ăn, chai tương/ớt/nước mắm nhựa, chai dầu gội, sữa tắm, nước rửa chén, nước giặt, ly nhựa sạch, hộp nhựa sạch, túi nilon sạch, màng bọc nhựa sạch. " +
  "Chai nước uống trong suốt có nắp nhựa, nhãn màng co, thân mỏng hoặc dấu hiệu PET phải là plastic, không phải glass. " +
  "Nhựa dính thức ăn/dầu mỡ, quá bẩn, ướt, lẫn nhiều vật liệu, ống hút, khay xốp, hộp xốp, tuýp kem đánh răng hoặc gói snack nhiều lớp phải trả unknown. " +
  "metal là nhóm Kim loại, gồm lon nhôm/nước ngọt/bia, lon thiếc/hộp đồ hộp kim loại sạch, nắp lon hoặc vỏ lon kim loại nhẹ. Bình xịt aerosol, pin, dao lam, kim tiêm, đồ điện tử, dây cáp hoặc kim loại sắc/nguy hại phải trả unknown. " +
  "paper gồm giấy văn phòng, báo, tạp chí, vở, sách mỏng, phong bì, túi giấy, hộp giấy nhỏ sạch/khô, hộp sữa giấy, hộp nước giấy hoặc Tetra Pak sạch/khô. Hộp sữa giấy sạch/khô phải phân loại là paper. Nếu hộp giấy còn nhiều chất lỏng, dính đồ ăn, ướt, mốc, dầu mỡ, khăn giấy/giấy vệ sinh đã dùng hoặc giấy than/giấy nhiệt khó xác định thì trả unknown. " +
  "glass là nhóm Thủy tinh, dùng khi có dấu hiệu thủy tinh rõ ràng: chai bia/rượu/nước ngọt thủy tinh, lọ thủy tinh, hũ thủy tinh, ly/cốc thủy tinh nguyên vẹn, vật dày cứng, phản xạ thủy tinh hoặc vật liệu glass được nhìn thấy chắc chắn. Gương, bóng đèn, gốm sứ, ly/cốc vỡ, thủy tinh vỡ/sắc cạnh phải trả unknown. " +
  "Rác hữu cơ, thức ăn thừa, vỏ trái cây, bã cà phê, túi trà, tã/băng vệ sinh, khẩu trang, găng tay, thuốc/vỉ thuốc, hóa chất, pin, rác y tế, rác điện tử, quần áo/vải, giày dép, cao su, gỗ, bao bì nhiều lớp khó xác định, vật lẫn nhiều loại hoặc ảnh không rõ vật thể chính đều trả unknown. " +
  "Ảnh chụp thùng rác, mô hình phân loại, trạm phân loại, poster, bảng hướng dẫn hoặc thiết bị chứa rác không phải là lượt gửi rác hợp lệ; " +
  "trường hợp đó không được phân loại là cardboard/plastic/metal theo vật liệu của thùng/mô hình, mà phải trả wasteType unknown, objectCount 0, isValidSubmission false và thêm fraudFlags bin_or_station_photo, no_visible_waste. " +
  "Phân loại vật thể chính trong ảnh, đánh giá chất lượng ảnh, rủi ro gian lận, và chỉ trả về JSON đúng schema. Nếu không chắc, dùng wasteType unknown, confidence thấp, isValidSubmission false.";

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
                text: WASTE_REVIEW_INSTRUCTIONS,
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
