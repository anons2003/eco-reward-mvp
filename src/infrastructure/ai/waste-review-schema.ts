import { z } from "zod";
import type { AIResult } from "@/core/entities/types";

export const wasteTypes = ["plastic", "metal", "paper", "glass", "unknown"] as const;
export const imageQualities = ["good", "blurry", "dark", "unclear"] as const;
export const contaminationRisks = ["low", "medium", "high"] as const;

export const wasteReviewSchema = z.object({
  isValidSubmission: z.boolean(),
  wasteType: z.enum(wasteTypes),
  confidence: z.number().min(0).max(1),
  objectCount: z.number().int().min(0).max(20),
  imageQuality: z.enum(imageQualities),
  contaminationRisk: z.enum(contaminationRisks),
  visibleEvidence: z.array(z.string().min(1).max(180)).max(8),
  fraudFlags: z.array(z.string().min(1).max(80)).max(8),
  notes: z.string().min(1).max(500),
});

export const wasteReviewJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["isValidSubmission", "wasteType", "confidence", "objectCount", "imageQuality", "contaminationRisk", "visibleEvidence", "fraudFlags", "notes"],
  properties: {
    isValidSubmission: {
      type: "boolean",
      description: "True only when the image clearly shows a real recyclable/waste item being submitted.",
    },
    wasteType: {
      type: "string",
      enum: wasteTypes,
      description: "The MVP waste material category. Only plastic, metal, paper, and glass can be auto-classified. Use unknown for every other material.",
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Model confidence from 0 to 1.",
    },
    objectCount: {
      type: "integer",
      minimum: 0,
      maximum: 20,
      description: "Number of relevant visible waste objects.",
    },
    imageQuality: {
      type: "string",
      enum: imageQualities,
      description: "Quality of the submitted photo for review.",
    },
    contaminationRisk: {
      type: "string",
      enum: contaminationRisks,
      description: "Risk that the waste item is dirty, mixed, unsafe, or unsuitable.",
    },
    visibleEvidence: {
      type: "array",
      maxItems: 8,
      items: { type: "string" },
      description: "Short visual facts supporting the decision.",
    },
    fraudFlags: {
      type: "array",
      maxItems: 8,
      items: { type: "string" },
      description: "Machine-readable risk flags such as no_visible_waste, screen_photo, duplicate_like, or unrelated_image.",
    },
    notes: {
      type: "string",
      description: "Short Vietnamese note for the admin reviewer.",
    },
  },
} as const;

const plasticEvidencePattern = /\b(pet|plastic|plastic bottle|water bottle|soft drink bottle|plastic cup|plastic bag|plastic container|plastic wrap)\b|chai nhựa|nhựa trong|thân nhựa|nắp nhựa|chai nước|nước uống|màng co|thân mỏng|ly nhựa|hộp nhựa|túi nilon|màng bọc nhựa/i;

function correctPlasticMisread(parsed: z.infer<typeof wasteReviewSchema>) {
  if (parsed.wasteType !== "glass") return parsed;

  const evidenceText = [...parsed.visibleEvidence, parsed.notes].join(" ");
  if (!plasticEvidencePattern.test(evidenceText)) return parsed;

  return {
    ...parsed,
    wasteType: "plastic" as const,
    visibleEvidence: ["material_consistency_guard: plastic evidence overrides glass", ...parsed.visibleEvidence].slice(0, 8),
    notes: `${parsed.notes} Hệ thống đã hiệu chỉnh sang nhóm nhựa vì bằng chứng thị giác cho thấy PET/nhựa.`.slice(0, 500),
  };
}

export function normalizeWasteReviewResult(value: unknown, meta: { provider: string; model: string }): AIResult {
  const parsed = correctPlasticMisread(wasteReviewSchema.parse(value));

  return {
    ...parsed,
    provider: meta.provider,
    model: meta.model,
  };
}
