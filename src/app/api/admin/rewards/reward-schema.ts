import { z } from "zod";
import type { Database } from "@/infrastructure/supabase/database.types";

export const rewardColumns = "id,title,description,points_required,stock,active,category,partner,image_url,expires_at,created_at";

export const rewardPayloadSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(500),
  pointsRequired: z.number().int().min(1).max(1_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  active: z.boolean().default(true),
  category: z.enum(["Voucher", "Quà tặng", "Đóng góp", "Dịch vụ"]).default("Voucher"),
  partner: z.string().trim().max(120).optional(),
  imageUrl: z.string().trim().url().max(1_000).or(z.literal("")).optional(),
  expiresAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).optional(),
});

export type RewardPayload = z.infer<typeof rewardPayloadSchema>;
export type RewardInsert = Database["public"]["Tables"]["reward_items"]["Insert"];
export type RewardUpdate = Database["public"]["Tables"]["reward_items"]["Update"];
export type RewardRow = Database["public"]["Tables"]["reward_items"]["Row"];
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export type RewardMutationTable<TValues> = {
  update(values: TValues): {
    eq(column: "id", value: string): {
      select(columns: string): {
        single(): Promise<{ data: RewardRow | null; error: { message: string } | null }>;
      };
    };
  };
};

export type AuditInsertTable = {
  insert(values: AuditLogInsert): Promise<{ error: { message: string } | null }>;
};

export function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export function toRewardValues(input: RewardPayload) {
  return {
    title: input.title,
    description: input.description,
    points_required: input.pointsRequired,
    stock: input.stock,
    active: input.active,
    category: input.category,
    partner: nullable(input.partner) ?? "SeaTech",
    image_url: nullable(input.imageUrl),
    expires_at: nullable(input.expiresAt),
  };
}
