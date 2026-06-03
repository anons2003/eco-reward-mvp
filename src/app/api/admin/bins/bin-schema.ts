import { z } from "zod";
import type { Database } from "@/infrastructure/supabase/database.types";
import { locationPayloadSchema } from "../locations/location-schema";

export const binColumns = "id,name,qr_code,location_name,location_id,lat,lng,active";
export const binLocationColumns = "id,name,address,lat,lng";

export type BinRow = Database["public"]["Tables"]["bins"]["Row"];
export type BinInsert = Database["public"]["Tables"]["bins"]["Insert"];
export type BinUpdate = Database["public"]["Tables"]["bins"]["Update"];
export type BinLocationRow = Pick<Database["public"]["Tables"]["locations"]["Row"], "id" | "name" | "address" | "lat" | "lng">;
export type AuditInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

export type AuditInsertTable = {
  insert(values: AuditInsert): Promise<{ error: { message: string } | null }>;
};

export type BinMutationTable<T> = {
  update(values: T): {
    eq(column: "id", value: string): {
      select(columns: string): {
        single(): Promise<{ data: BinRow | null; error: { message: string } | null }>;
      };
    };
  };
};

export const binCreatePayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  location: locationPayloadSchema,
  active: z.boolean().default(true),
});

export const binPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  qrCode: z.string().trim().min(3).max(80),
  locationId: z.string().uuid(),
  active: z.boolean().default(true),
});

export function normalizeQrCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

export function toBinValues(input: { name: string; active: boolean }, location: BinLocationRow, qrCode: string): BinInsert {
  return {
    name: input.name.trim(),
    qr_code: normalizeQrCode(qrCode),
    location_id: location.id,
    location_name: location.name,
    lat: location.lat,
    lng: location.lng,
    active: input.active,
  };
}
