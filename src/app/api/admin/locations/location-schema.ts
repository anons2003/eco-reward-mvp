import { z } from "zod";
import type { Database } from "@/infrastructure/supabase/database.types";

export const locationColumns = "id,name,address,district,ward,lat,lng,active,created_at,updated_at";

export type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
export type LocationInsert = Database["public"]["Tables"]["locations"]["Insert"];
export type LocationUpdate = Database["public"]["Tables"]["locations"]["Update"];
export type AuditInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export type AuditInsertTable = {
  insert(values: AuditInsert): Promise<{ error: { message: string } | null }>;
};

export type LocationMutationError = {
  code?: string;
  message: string;
};

export const locationPayloadSchema = z.object({
  name: z.string().trim().min(2).max(140),
  address: z.string().trim().min(4).max(240),
  district: z.string().trim().max(80).nullable().optional(),
  ward: z.string().trim().max(80).nullable().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  active: z.boolean().default(true),
});

function addressParts(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    ward: parts.length >= 4 ? parts.at(-3) ?? "" : "",
    district: parts.length >= 3 ? parts.at(-2) ?? "" : "",
  };
}

export function toLocationValues(input: z.infer<typeof locationPayloadSchema>): LocationInsert {
  const derived = addressParts(input.address);

  return {
    name: input.name.trim(),
    address: input.address.trim(),
    district: input.district?.trim() || derived.district || "Chưa phân loại",
    ward: input.ward?.trim() || derived.ward || "Chưa phân loại",
    lat: input.lat,
    lng: input.lng,
    active: input.active,
  };
}

export function locationMutationError(error: LocationMutationError | null | undefined, fallback: string) {
  if (!error) return fallback;
  if (error.code === "23505" || error.message.toLowerCase().includes("duplicate key")) {
    return "Địa điểm này đã tồn tại. Hãy chọn địa điểm hiện có hoặc đổi tên/địa chỉ trước khi lưu.";
  }
  return error.message || fallback;
}
