import { z } from "zod";
import type { Database } from "@/infrastructure/supabase/database.types";

export const binColumns = "id,name,qr_code,location_name,lat,lng,active";

export type BinRow = Database["public"]["Tables"]["bins"]["Row"];
export type BinInsert = Database["public"]["Tables"]["bins"]["Insert"];
export type BinUpdate = Database["public"]["Tables"]["bins"]["Update"];
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

export const binPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  qrCode: z.string().trim().min(3).max(80),
  locationName: z.string().trim().min(2).max(180),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  active: z.boolean().default(true),
});

export function normalizeQrCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

export function toBinValues(input: z.infer<typeof binPayloadSchema>): BinInsert {
  return {
    name: input.name.trim(),
    qr_code: normalizeQrCode(input.qrCode),
    location_name: input.locationName.trim(),
    lat: input.lat,
    lng: input.lng,
    active: input.active,
  };
}
