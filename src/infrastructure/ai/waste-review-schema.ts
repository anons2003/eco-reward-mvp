import { z } from "zod";
import type { AIResult } from "@/core/entities/types";

export const wasteTypes = ["plastic_bottle", "metal_can", "paper", "cardboard", "glass_bottle", "organic", "hazardous", "unknown"] as const;
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
      description: "The most likely waste category. Use unknown when uncertain.",
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

export function normalizeWasteReviewResult(value: unknown, meta: { provider: string; model: string }): AIResult {
  const parsed = wasteReviewSchema.parse(value);

  return {
    ...parsed,
    provider: meta.provider,
    model: meta.model,
  };
}
