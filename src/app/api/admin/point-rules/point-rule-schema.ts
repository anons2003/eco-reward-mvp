import { z } from "zod";
import { WASTE_TYPES } from "@/core/points/point-rules";
import type { Database } from "@/infrastructure/supabase/database.types";

export const pointRuleColumns = "waste_type,points,active,updated_at";

export const pointRulePayloadSchema = z.object({
  wasteType: z.enum(WASTE_TYPES),
  points: z.number().int().min(0).max(1_000_000),
  active: z.boolean().default(true),
});

export const pointRuleUpdateSchema = z.object({
  points: z.number().int().min(0).max(1_000_000),
  active: z.boolean(),
});

export type PointRulePayload = z.infer<typeof pointRulePayloadSchema>;
export type PointRuleUpdatePayload = z.infer<typeof pointRuleUpdateSchema>;
export type PointRuleRow = Database["public"]["Tables"]["point_rules"]["Row"];
export type PointRuleInsert = Database["public"]["Tables"]["point_rules"]["Insert"];
export type PointRuleUpdate = Database["public"]["Tables"]["point_rules"]["Update"];
export type AuditInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export type AuditInsertTable = {
  insert(values: AuditInsert): Promise<{ error: { message: string } | null }>;
};

export function toPointRuleInsert(input: PointRulePayload): PointRuleInsert {
  return {
    waste_type: input.wasteType,
    points: input.points,
    active: input.active,
    updated_at: new Date().toISOString(),
  };
}

export function toPointRuleUpdate(input: PointRuleUpdatePayload): PointRuleUpdate {
  return {
    points: input.points,
    active: input.active,
    updated_at: new Date().toISOString(),
  };
}
